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

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def escape_sql_string(value):
    """Экранирование строк для SQL"""
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            cur = conn.cursor()
            
            query = f'''
                SELECT id, venue, entry_date::text as date, 
                       forks, knives, steak_knives, spoons, dessert_spoons,
                       ice_cooler, plates, sugar_tongs, ice_tongs, ashtrays,
                       responsible_name, responsible_date::text,
                       created_at::text
                FROM t_p23128842_inventory_cutlery_tr.inventory_entries
                WHERE venue = {escape_sql_string(venue)}
                ORDER BY entry_date DESC
            '''
            
            cur.execute(query)
            rows = cur.fetchall()
            
            entries = []
            for row in rows:
                entries.append({
                    'id': row[0],
                    'venue': row[1],
                    'date': row[2],
                    'forks': row[3],
                    'knives': row[4],
                    'steak_knives': row[5],
                    'spoons': row[6],
                    'dessert_spoons': row[7],
                    'ice_cooler': row[8],
                    'plates': row[9],
                    'sugar_tongs': row[10],
                    'ice_tongs': row[11],
                    'ashtrays': row[12],
                    'responsible_name': row[13],
                    'responsible_date': row[14],
                    'created_at': row[15]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'entries': entries}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            query = f'''
                INSERT INTO t_p23128842_inventory_cutlery_tr.inventory_entries
                (venue, entry_date, forks, knives, steak_knives, spoons, 
                 dessert_spoons, ice_cooler, plates, sugar_tongs, ice_tongs, ashtrays,
                 responsible_name, responsible_date)
                VALUES (
                    {escape_sql_string(body_data['venue'])},
                    {escape_sql_string(body_data['date'])},
                    {body_data['forks']},
                    {body_data['knives']},
                    {body_data['steakKnives']},
                    {body_data['spoons']},
                    {body_data['dessertSpoons']},
                    {body_data['iceCooler']},
                    {body_data['plates']},
                    {body_data['sugarTongs']},
                    {body_data['iceTongs']},
                    {body_data.get('ashtrays', 0)},
                    {escape_sql_string(body_data.get('responsible_name'))},
                    {escape_sql_string(body_data.get('responsible_date'))}
                )
                RETURNING id, venue, entry_date::text as date, 
                          forks, knives, steak_knives, spoons, dessert_spoons,
                          ice_cooler, plates, sugar_tongs, ice_tongs, ashtrays,
                          responsible_name, responsible_date::text
            '''
            
            cur.execute(query)
            row = cur.fetchone()
            new_entry = {
                'id': row[0],
                'venue': row[1],
                'date': row[2],
                'forks': row[3],
                'knives': row[4],
                'steak_knives': row[5],
                'spoons': row[6],
                'dessert_spoons': row[7],
                'ice_cooler': row[8],
                'plates': row[9],
                'sugar_tongs': row[10],
                'ice_tongs': row[11],
                'ashtrays': row[12],
                'responsible_name': row[13],
                'responsible_date': row[14]
            }
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'entry': new_entry}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            entry_id = body_data.get('id')
            
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
            
            query = f'''
                UPDATE t_p23128842_inventory_cutlery_tr.inventory_entries
                SET venue = {escape_sql_string(body_data['venue'])},
                    entry_date = {escape_sql_string(body_data['date'])},
                    forks = {body_data['forks']},
                    knives = {body_data['knives']},
                    steak_knives = {body_data['steakKnives']},
                    spoons = {body_data['spoons']},
                    dessert_spoons = {body_data['dessertSpoons']},
                    ice_cooler = {body_data['iceCooler']},
                    plates = {body_data['plates']},
                    sugar_tongs = {body_data['sugarTongs']},
                    ice_tongs = {body_data['iceTongs']},
                    ashtrays = {body_data.get('ashtrays', 0)},
                    responsible_name = {escape_sql_string(body_data.get('responsible_name'))},
                    responsible_date = {escape_sql_string(body_data.get('responsible_date'))}
                WHERE id = {entry_id}
                RETURNING id, venue, entry_date::text as date, 
                          forks, knives, steak_knives, spoons, dessert_spoons,
                          ice_cooler, plates, sugar_tongs, ice_tongs, ashtrays,
                          responsible_name, responsible_date::text
            '''
            
            cur.execute(query)
            row = cur.fetchone()
            updated_entry = None
            if row:
                updated_entry = {
                    'id': row[0],
                    'venue': row[1],
                    'date': row[2],
                    'forks': row[3],
                    'knives': row[4],
                    'steak_knives': row[5],
                    'spoons': row[6],
                    'dessert_spoons': row[7],
                    'ice_cooler': row[8],
                    'plates': row[9],
                    'sugar_tongs': row[10],
                    'ice_tongs': row[11],
                    'ashtrays': row[12],
                    'responsible_name': row[13],
                    'responsible_date': row[14]
                }
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'entry': updated_entry}),
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
            
            query = f'''
                DELETE FROM t_p23128842_inventory_cutlery_tr.inventory_entries
                WHERE id = {entry_id}
            '''
            
            cur.execute(query)
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