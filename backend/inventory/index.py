'''
Business: API для управления инвентаризацией приборов по заведениям
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с данными инвентаризации
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            venue = params.get('venue', 'PORT')
            
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute('''
                SELECT id, venue, entry_date::text as date, 
                       forks, knives, steak_knives, spoons, dessert_spoons,
                       ice_cooler, plates, sugar_tongs, ice_tongs,
                       created_at::text
                FROM t_p23128842_inventory_cutlery_tr.inventory_entries
                WHERE venue = %s
                ORDER BY entry_date DESC
            ''', (venue,))
            
            entries = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'entries': [dict(row) for row in entries]}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute('''
                INSERT INTO t_p23128842_inventory_cutlery_tr.inventory_entries
                (venue, entry_date, forks, knives, steak_knives, spoons, 
                 dessert_spoons, ice_cooler, plates, sugar_tongs, ice_tongs)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, venue, entry_date::text as date, 
                          forks, knives, steak_knives, spoons, dessert_spoons,
                          ice_cooler, plates, sugar_tongs, ice_tongs
            ''', (
                body_data['venue'],
                body_data['date'],
                body_data['forks'],
                body_data['knives'],
                body_data['steakKnives'],
                body_data['spoons'],
                body_data['dessertSpoons'],
                body_data['iceCooler'],
                body_data['plates'],
                body_data['sugarTongs'],
                body_data['iceTongs']
            ))
            
            new_entry = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'entry': dict(new_entry)}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            entry_id = params.get('id')
            
            if not entry_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID is required'}),
                    'isBase64Encoded': False
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute('''
                DELETE FROM t_p23128842_inventory_cutlery_tr.inventory_entries
                WHERE id = %s
            ''', (entry_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
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
