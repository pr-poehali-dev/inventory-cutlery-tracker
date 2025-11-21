'''
Business: Экспорт полного бэкапа базы данных в JSON формате
Args: event - dict с httpMethod
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с данными всех записей в JSON
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            query = '''
                SELECT id, venue, entry_date::text as date, 
                       forks, knives, steak_knives, spoons, dessert_spoons,
                       ice_cooler, plates, sugar_tongs, ice_tongs, ashtrays,
                       responsible_name, responsible_date::text,
                       created_at::text
                FROM t_p23128842_inventory_cutlery_tr.inventory_entries
                ORDER BY venue, entry_date DESC
            '''
            
            cur.execute(query)
            all_entries = cur.fetchall()
            cur.close()
            conn.close()
            
            backup_data = {
                'backup_date': datetime.now().isoformat(),
                'total_records': len(all_entries),
                'version': '1.0',
                'entries': [dict(row) for row in all_entries]
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': f'attachment; filename="inventory_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json"'
                },
                'body': json.dumps(backup_data, ensure_ascii=False, indent=2),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
