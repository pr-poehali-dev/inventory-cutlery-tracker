#!/usr/bin/env node
/**
 * Скрипт для развертывания Cloud Function в Yandex Cloud
 * Запуск: node deploy-to-yandex-cloud.js
 */

const fs = require('fs');
const https = require('https');
const { createSign } = require('crypto');
const archiver = require('archiver');
const { Buffer } = require('buffer');

// Конфигурация (читаем из переменных окружения или файла)
const config = {
  folderId: process.env.YC_FOLDER_ID || 'b1g8tru4u33n2sq09r6b',
  serviceAccountKey: JSON.parse(process.env.YC_SERVICE_ACCOUNT_KEY || fs.readFileSync('.yc-key.json', 'utf8')),
  databaseUrl: process.env.DATABASE_URL || '',
  functionName: 'inventory-api',
  runtime: 'python311',
  entrypoint: 'index.handler',
  memory: 256 * 1024 * 1024,
  timeout: '30s'
};

// Создание JWT для получения IAM токена
function createJWT(serviceAccountKey) {
  const now = Math.floor(Date.now() / 1000);
  
  const header = Buffer.from(JSON.stringify({
    alg: 'PS256',
    typ: 'JWT',
    kid: serviceAccountKey.id
  })).toString('base64url');
  
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccountKey.service_account_id,
    aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
    iat: now,
    exp: now + 3600
  })).toString('base64url');
  
  const signatureInput = `${header}.${payload}`;
  const sign = createSign('RSA-SHA256');
  sign.update(signatureInput);
  sign.end();
  
  const signature = sign.sign({
    key: serviceAccountKey.private_key,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
  }, 'base64url');
  
  return `${signatureInput}.${signature}`;
}

// HTTP запрос
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

// Получение IAM токена
async function getIAMToken(serviceAccountKey) {
  console.log('🔑 Получаю IAM токен...');
  
  const jwt = createJWT(serviceAccountKey);
  
  const result = await makeRequest({
    hostname: 'iam.api.cloud.yandex.net',
    path: '/iam/v1/tokens',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, { jwt });
  
  if (result.status === 200) {
    console.log('✅ IAM токен получен\n');
    return result.data.iamToken;
  }
  
  throw new Error(`Не удалось получить IAM токен: ${JSON.stringify(result)}`);
}

// Создание ZIP архива
async function createZipArchive() {
  console.log('📦 Создаю ZIP архив с кодом...');
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('data', chunk => chunks.push(chunk));
    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      console.log(`✅ Архив создан (${buffer.length} байт)\n`);
      resolve(buffer);
    });
    archive.on('error', reject);
    
    // Добавляем файлы
    archive.file('backend/inventory/index.py', { name: 'index.py' });
    archive.file('backend/inventory/requirements.txt', { name: 'requirements.txt' });
    
    archive.finalize();
  });
}

// Поиск существующей функции
async function findFunction(iamToken, folderId, functionName) {
  console.log('🔍 Проверяю существующие функции...');
  
  const result = await makeRequest({
    hostname: 'serverless-functions.api.cloud.yandex.net',
    path: `/functions/v1/functions?folderId=${folderId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${iamToken}`
    }
  });
  
  if (result.status === 200 && result.data.functions) {
    const func = result.data.functions.find(f => f.name === functionName);
    if (func) {
      console.log(`✅ Найдена существующая функция: ${func.id}\n`);
      return func.id;
    }
  }
  
  console.log('📝 Функция не найдена, создам новую...\n');
  return null;
}

// Создание функции
async function createFunction(iamToken, folderId, functionName) {
  console.log('📝 Создаю новую функцию...');
  
  const result = await makeRequest({
    hostname: 'serverless-functions.api.cloud.yandex.net',
    path: '/functions/v1/functions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${iamToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    folderId,
    name: functionName,
    description: 'API для управления инвентаризацией приборов'
  });
  
  if (result.status === 200 && result.data.metadata) {
    const functionId = result.data.metadata.functionId;
    console.log(`✅ Функция создана: ${functionId}\n`);
    return functionId;
  }
  
  throw new Error(`Не удалось создать функцию: ${JSON.stringify(result)}`);
}

// Создание версии функции
async function createVersion(iamToken, functionId, zipContent, config) {
  console.log('🔄 Загружаю код функции...');
  
  const result = await makeRequest({
    hostname: 'serverless-functions.api.cloud.yandex.net',
    path: '/functions/v1/versions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${iamToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    functionId,
    runtime: config.runtime,
    entrypoint: config.entrypoint,
    resources: {
      memory: config.memory
    },
    executionTimeout: config.timeout,
    serviceAccountId: config.serviceAccountKey.service_account_id,
    environment: {
      DATABASE_URL: config.databaseUrl
    },
    content: zipContent.toString('base64')
  });
  
  if (result.status === 200) {
    console.log('✅ Версия функции создана\n');
    return result.data;
  }
  
  throw new Error(`Не удалось создать версию: ${JSON.stringify(result)}`);
}

// Сделать функцию публичной
async function makePublic(iamToken, functionId) {
  console.log('🌐 Делаю функцию публично доступной...');
  
  const result = await makeRequest({
    hostname: 'serverless-functions.api.cloud.yandex.net',
    path: `/functions/v1/functions/${functionId}:setAccessBindings`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${iamToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    accessBindings: [{
      roleId: 'functions.functionInvoker',
      subject: { id: 'allUsers', type: 'system' }
    }]
  });
  
  console.log('✅ Функция сделана публичной\n');
}

// Главная функция
async function main() {
  try {
    console.log('🚀 Начинаю развертывание функции в Yandex Cloud...\n');
    
    // Получаем IAM токен
    const iamToken = await getIAMToken(config.serviceAccountKey);
    
    // Создаем ZIP
    const zipContent = await createZipArchive();
    
    // Ищем или создаем функцию
    let functionId = await findFunction(iamToken, config.folderId, config.functionName);
    if (!functionId) {
      functionId = await createFunction(iamToken, config.folderId, config.functionName);
    }
    
    // Создаем версию
    await createVersion(iamToken, functionId, zipContent, config);
    
    // Делаем публичной
    await makePublic(iamToken, functionId);
    
    // URL функции
    const functionUrl = `https://functions.yandexcloud.net/${functionId}`;
    
    console.log('=' + '='.repeat(60));
    console.log('✅ РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!');
    console.log('=' + '='.repeat(60));
    console.log(`\n📍 URL функции: ${functionUrl}`);
    console.log(`\n💡 Используй этот URL в своем приложении`);
    console.log(`\nПример запроса:`);
    console.log(`  curl "${functionUrl}?venue=PORT"`);
    console.log();
    
    // Сохраняем URL
    fs.writeFileSync('yc-function-url.txt', functionUrl);
    console.log('📝 URL сохранен в файл: yc-function-url.txt\n');
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
