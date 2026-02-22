// scripts/generate-search-index.js
// Запускать в Node.js: node generate-search-index.js

const fs = require('fs');
const path = require('path');

// Пути к файлам
const GUIDS_DATA_PATH = path.join(__dirname, 'guids-data.json');
const OUTPUT_PATH = path.join(__dirname, 'search-index.json');

// Чтение данных
const guidsData = JSON.parse(fs.readFileSync(GUIDS_DATA_PATH, 'utf8'));

const searchIndex = {};

guidsData.categories.forEach(category => {
  category.guides.forEach(guide => {
    if (!guide.sectionId) {
      console.warn(`⚠️ Пропущен гайд без sectionId: ${guide.title}`);
      return;
    }

    // Базовые алиасы
    const aliases = new Set();
    
    // Название гайда
    aliases.add(guide.title.toLowerCase());
    
    // Название мода
    aliases.add(category.title.toLowerCase());
    
    // Комбинации
    aliases.add(`${category.title} ${guide.title}`.toLowerCase());
    aliases.add(`${guide.title} ${category.title}`.toLowerCase());
    
    // ID секции (если число)
    if (/^\d/.test(guide.sectionId)) {
      aliases.add(guide.sectionId);
    }
    
    // Добавляем ручные алиасы если есть
    if (guide.searchAliases && Array.isArray(guide.searchAliases)) {
      guide.searchAliases.forEach(alias => aliases.add(alias.toLowerCase()));
    }

    searchIndex[guide.sectionId] = {
      title: guide.title,
      mod: category.title,
      aliases: Array.from(aliases),
      image: guide.previewImage || "" // Опциональное превью
    };
  });
});

// Сохраняем результат
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(searchIndex, null, 2), 'utf8');

console.log(`✅ search-index.json успешно создан!`);
console.log(`📊 Найдено ${Object.keys(searchIndex).length} секций`);