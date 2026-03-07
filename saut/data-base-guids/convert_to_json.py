import json
import re
from pathlib import Path
import os

# === НАСТРОЙКИ ===
# Имя файла которое ищем
TARGET_FILENAME = 'warp-info.txt'

# Выходной JSON файл (сохранится там где лежит скрипт)
OUTPUT_FILE = 'departments.json'

# Пути для поиска (относительно скрипта)
SEARCH_PATHS = [
    '.',                              # Та же папка где скрипт
    './saut/pages/warp-info/',        # saut/pages/warp-info/
    '../saut/pages/warp-info/',       # ../saut/pages/warp-info/
    '../../saut/pages/warp-info/',    # ../../saut/pages/warp-info/
    './pages/warp-info/',             # ./pages/warp-info/
    '../pages/warp-info/',            # ../pages/warp-info/
    './data-base-guids/',             # ./data-base-guids/
    '../data-base-guids/',            # ../data-base-guids/
]

def find_input_file():
    """Ищет входной файл во всех возможных местах"""
    script_dir = Path(__file__).parent.absolute()
    
    print(f'🔍 Поиск файла {TARGET_FILENAME}...\n')
    
    for path in SEARCH_PATHS:
        full_path = script_dir / path / TARGET_FILENAME
        print(f'   Проверяю: {full_path}')
        
        if full_path.exists():
            print(f'   ✅ Найдено!\n')
            return full_path
    
    print(f'\n❌ Файл не найден ни в одном из мест!\n')
    return None

def parse_departments(content):
    """Парсит JavaScript объект departments в Python словарь"""
    departments = {}
    
    # Находим все отделы: название: { name: "...", items: [...] }
    dept_pattern = r'(\w+):\s*\{\s*name:\s*"([^"]+)",\s*items:\s*\[(.*?)\]\s*\}'
    
    for match in re.finditer(dept_pattern, content, re.DOTALL):
        key = match.group(1)
        name = match.group(2)
        items_text = match.group(3)
        
        # Парсим предметы
        items = []
        item_pattern = r'\{\s*name:\s*"([^"]+)",\s*price:\s*"([^"]+)"\s*\}'
        
        for item_match in re.finditer(item_pattern, items_text):
            items.append({
                "name": item_match.group(1),
                "price": item_match.group(2)
            })
        
        departments[key] = {
            "name": name,
            "items": items
        }
    
    return departments

def main():
    # Ищем файл
    input_file = find_input_file()
    
    if not input_file:
        print('💡 Решение:')
        print('   1. Положи warp-info.txt в одну из папок выше')
        print('   2. Или положи скрипт рядом с warp-info.txt')
        print('   3. Или укажи полный путь в SEARCH_PATHS')
        return
    
    # Читаем данные
    print(f'📖 Читаю {input_file}...')
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f'❌ Ошибка чтения: {e}')
        return
    
    # Парсим
    print('🔧 Парсю данные...')
    departments = parse_departments(content)
    
    if not departments:
        print('❌ Не удалось распарсить данные!')
        print('Убедись что в файле есть объект departments с отделами')
        print('Пример формата:')
        print('  vanilla: { name: "Vanilla", items: [')
        print('    { name: "Предмет", price: "Цена" }')
        print('  ]}')
        return
    
    # Сохраняем JSON
    print(f'💾 Сохраняю в {OUTPUT_FILE}...')
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(departments, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f'❌ Ошибка сохранения: {e}')
        return
    
    # Статистика
    total_items = sum(len(dept['items']) for dept in departments.values())
    
    print(f'\n✅ Готово!')
    print(f'📊 Найдено отделов: {len(departments)}')
    print(f'📦 Всего предметов: {total_items}')
    print(f'📁 Файл сохранён: {Path(OUTPUT_FILE).absolute()}')

if __name__ == '__main__':
    main()