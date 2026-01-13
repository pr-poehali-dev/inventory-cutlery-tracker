#!/usr/bin/env python3
"""
Скрипт для развертывания Cloud Function в Yandex Cloud
Использует Yandex Cloud API для создания/обновления функции
"""

import os
import json
import time
import base64
import zipfile
import requests
from io import BytesIO
from datetime import datetime, timedelta
import jwt

# Конфигурация
FOLDER_ID = os.environ.get('YC_FOLDER_ID')
SERVICE_ACCOUNT_KEY = json.loads(os.environ.get('YC_SERVICE_ACCOUNT_KEY'))
DATABASE_URL = os.environ.get('DATABASE_URL')

FUNCTION_NAME = 'inventory-api'
FUNCTION_DESCRIPTION = 'API для управления инвентаризацией приборов'
RUNTIME = 'python311'
ENTRYPOINT = 'index.handler'
MEMORY_MB = 256
TIMEOUT_SEC = 30

def get_iam_token():
    """Получить IAM токен используя Service Account Key"""
    now = int(time.time())
    payload = {
        'aud': 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
        'iss': SERVICE_ACCOUNT_KEY['service_account_id'],
        'iat': now,
        'exp': now + 3600
    }
    
    private_key = SERVICE_ACCOUNT_KEY['private_key']
    encoded_token = jwt.encode(
        payload,
        private_key,
        algorithm='PS256',
        headers={'kid': SERVICE_ACCOUNT_KEY['id']}
    )
    
    response = requests.post(
        'https://iam.api.cloud.yandex.net/iam/v1/tokens',
        json={'jwt': encoded_token}
    )
    response.raise_for_status()
    return response.json()['iamToken']

def create_zip_archive():
    """Создать ZIP архив с кодом функции"""
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Добавляем index.py
        with open('backend/inventory/index.py', 'r') as f:
            zip_file.writestr('index.py', f.read())
        
        # Добавляем requirements.txt
        with open('backend/inventory/requirements.txt', 'r') as f:
            zip_file.writestr('requirements.txt', f.read())
    
    zip_buffer.seek(0)
    return zip_buffer.read()

def find_existing_function(iam_token):
    """Найти существующую функцию по имени"""
    headers = {
        'Authorization': f'Bearer {iam_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        f'https://serverless-functions.api.cloud.yandex.net/functions/v1/functions',
        headers=headers,
        params={'folderId': FOLDER_ID}
    )
    
    if response.status_code == 200:
        functions = response.json().get('functions', [])
        for func in functions:
            if func['name'] == FUNCTION_NAME:
                return func['id']
    
    return None

def create_function(iam_token):
    """Создать новую функцию"""
    headers = {
        'Authorization': f'Bearer {iam_token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'folderId': FOLDER_ID,
        'name': FUNCTION_NAME,
        'description': FUNCTION_DESCRIPTION
    }
    
    response = requests.post(
        'https://serverless-functions.api.cloud.yandex.net/functions/v1/functions',
        headers=headers,
        json=data
    )
    response.raise_for_status()
    
    operation = response.json()
    function_id = operation['metadata']['functionId']
    print(f"✅ Функция создана: {function_id}")
    return function_id

def create_function_version(iam_token, function_id, zip_content):
    """Создать новую версию функции с кодом"""
    headers = {
        'Authorization': f'Bearer {iam_token}'
    }
    
    data = {
        'functionId': function_id,
        'runtime': RUNTIME,
        'entrypoint': ENTRYPOINT,
        'resources': {
            'memory': MEMORY_MB * 1024 * 1024
        },
        'executionTimeout': f'{TIMEOUT_SEC}s',
        'serviceAccountId': SERVICE_ACCOUNT_KEY['service_account_id'],
        'environment': {
            'DATABASE_URL': DATABASE_URL
        },
        'content': base64.b64encode(zip_content).decode('utf-8')
    }
    
    response = requests.post(
        f'https://serverless-functions.api.cloud.yandex.net/functions/v1/versions',
        headers=headers,
        json=data
    )
    response.raise_for_status()
    
    operation = response.json()
    print(f"✅ Версия функции создана")
    
    # Ждем завершения операции
    operation_id = operation['id']
    return wait_for_operation(iam_token, operation_id)

def wait_for_operation(iam_token, operation_id):
    """Ожидание завершения операции"""
    headers = {
        'Authorization': f'Bearer {iam_token}'
    }
    
    max_attempts = 60
    for attempt in range(max_attempts):
        response = requests.get(
            f'https://operation.api.cloud.yandex.net/operations/{operation_id}',
            headers=headers
        )
        
        if response.status_code == 200:
            operation = response.json()
            
            if operation.get('done'):
                if 'error' in operation:
                    raise Exception(f"Операция завершилась с ошибкой: {operation['error']}")
                return operation.get('response', {})
        
        time.sleep(2)
    
    raise Exception("Timeout: операция не завершилась за отведенное время")

def make_function_public(iam_token, function_id):
    """Сделать функцию публично доступной"""
    headers = {
        'Authorization': f'Bearer {iam_token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'functionId': function_id,
        'invokeAction': 'ALLOW'
    }
    
    response = requests.post(
        f'https://serverless-functions.api.cloud.yandex.net/functions/v1/functions/{function_id}:setAccessBindings',
        headers=headers,
        json={
            'accessBindings': [{
                'roleId': 'functions.functionInvoker',
                'subject': {'id': 'allUsers', 'type': 'system'}
            }]
        }
    )
    
    if response.status_code in [200, 201]:
        print(f"✅ Функция сделана публичной")
    else:
        print(f"⚠️  Не удалось сделать функцию публичной: {response.text}")

def get_function_url(function_id):
    """Получить HTTP URL функции"""
    return f"https://functions.yandexcloud.net/{function_id}"

def main():
    print("🚀 Начинаю развертывание функции в Yandex Cloud...\n")
    
    # Проверка переменных окружения
    if not FOLDER_ID or not SERVICE_ACCOUNT_KEY or not DATABASE_URL:
        print("❌ Ошибка: не заданы необходимые переменные окружения")
        print("   YC_FOLDER_ID:", "✅" if FOLDER_ID else "❌")
        print("   YC_SERVICE_ACCOUNT_KEY:", "✅" if SERVICE_ACCOUNT_KEY else "❌")
        print("   DATABASE_URL:", "✅" if DATABASE_URL else "❌")
        return
    
    try:
        # Получаем IAM токен
        print("🔑 Получаю IAM токен...")
        iam_token = get_iam_token()
        print("✅ IAM токен получен\n")
        
        # Создаем ZIP архив с кодом
        print("📦 Создаю ZIP архив с кодом...")
        zip_content = create_zip_archive()
        print(f"✅ Архив создан ({len(zip_content)} байт)\n")
        
        # Проверяем существующую функцию
        print("🔍 Проверяю существующие функции...")
        function_id = find_existing_function(iam_token)
        
        if function_id:
            print(f"✅ Найдена существующая функция: {function_id}\n")
        else:
            print("📝 Создаю новую функцию...")
            function_id = create_function(iam_token)
            print()
        
        # Создаем новую версию функции
        print("🔄 Загружаю код функции...")
        version = create_function_version(iam_token, function_id, zip_content)
        print()
        
        # Делаем функцию публичной
        print("🌐 Делаю функцию публично доступной...")
        make_function_public(iam_token, function_id)
        print()
        
        # Получаем URL
        function_url = get_function_url(function_id)
        
        print("=" * 60)
        print("✅ РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!")
        print("=" * 60)
        print(f"\n📍 URL функции: {function_url}")
        print(f"\n💡 Используй этот URL в своем приложении вместо старого")
        print(f"\nПример запроса:")
        print(f"  GET {function_url}?venue=PORT")
        print()
        
        # Сохраняем URL в файл
        with open('yc-function-url.txt', 'w') as f:
            f.write(function_url)
        print("📝 URL сохранен в файл: yc-function-url.txt\n")
        
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
