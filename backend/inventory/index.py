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
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
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
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
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
            updated_entry = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'entry': dict(updated_entry) if updated_entry else None}),
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