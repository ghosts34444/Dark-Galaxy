import json
import re
from pathlib import Path

INPUT_FILE = 'guides.txt'
OUTPUT_FILE = 'guids-data.json'

def parse_guides(content):
    categories = []
    current_category = None
    current_guide = None
    sections = []
    
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        
        if not line:
            continue
        
        # === КАТЕГОРИЯ ===
        if line.startswith('===') and line.endswith('==='):
            if current_category:
                if current_guide:
                    current_guide['sections'] = sections
                    current_category['guides'].append(current_guide)
                categories.append(current_category)
            
            category_name = line.replace('===', '').strip()
            current_category = {
                'id': category_name.lower().replace(' ', '-'),
                'title': category_name,
                'image': '../../assets/ghost/лого1.png',
                'guides': []
            }
            current_guide = None
            sections = []
            continue
        
        # === СЕКЦИЯ С ID ===
        match = re.match(r'(\d+\.\d+)\s+\[(.+)\]', line)
        if match and current_category:
            if current_guide:
                current_guide['sections'] = sections
                current_category['guides'].append(current_guide)
            
            section_id = match.group(1)
            machine_name = match.group(2)
            
            current_guide = {
                'id': f"{current_category['id']}-{section_id.replace('.', '-')}",
                'sectionId': section_id,
                'title': machine_name,
                'searchAliases': [
                    machine_name.lower(),
                    current_category['id'],
                    f"{current_category['id']} {machine_name.lower()}",
                    section_id
                ],
                'sections': []
            }
            sections = []
            continue
        
        # === КАРТИНКА ===
        if line.startswith('<') and line.endswith('>'):
            if sections:
                sections[-1]['image'] = line[1:-1]
            continue
        
        # === GUI ===
        if line.startswith('[') and line.endswith(']'):
            if sections:
                sections[-1]['guiId'] = line[1:-1]
            continue
        
        # === ТЕКСТ ===
        if current_guide:
            sections.append({
                'type': 'text',
                'content': f'<p>{line}</p>',
                'image': '',
                'guiId': ''
            })
    
    # Последняя категория
    if current_category:
        if current_guide:
            current_guide['sections'] = sections
            current_category['guides'].append(current_guide)
        categories.append(current_category)
    
    return {'categories': categories}

def main():
    if not Path(INPUT_FILE).exists():
        print(f'❌ Файл {INPUT_FILE} не найден!')
        return
    
    print(f'📖 Читаю {INPUT_FILE}...')
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print('🔧 Парсю гайды...')
    data = parse_guides(content)
    
    if not data['categories']:
        print('❌ Не удалось распарсить!')
        return
    
    print(f'💾 Сохраняю в {OUTPUT_FILE}...')
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    total_guides = sum(len(cat['guides']) for cat in data['categories'])
    print(f'\n✅ Готово!')
    print(f'📊 Категорий: {len(data["categories"])}')
    print(f'📦 Гайдов: {total_guides}')

if __name__ == '__main__':
    main()