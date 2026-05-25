// Завдання 1. Аналіз запиту та індексація
// Нехай дано наступний запит:
// db.tracks.find({
//   track_genre: "pop",
//   "audio_features.danceability": { $gte: 0.7 }
// }).sort({ popularity: -1 }).toArray();
// Це ресурсоємний запит, оскільки він поєднує пошук за точним збігом та діапазонний пошук.
// Виконайте наступні кроки:
// За допомогою explain() проаналізуйте план виконання запиту без індексів.
// Створіть відповідний індекс.
// Повторно виконайте explain() після створення індексу.

db.runCommand({
    explain: {
        find: 'tracks',
        filter: {
            track_genre: 'pop',
            'audio_features.danceability': {$gte: 0.7}
        },
        sort: {popularity: -1}
    },
    verbosity: 'executionStats'
})

db.tracks.createIndex({
    track_genre: 1,
    'audio_features.danceability': 1
})

// Завдання 2. Індекс для інших полів
// Припустимо, що ви часто шукаєте музику для роботи, використовуючи поля
// audio_features.instrumentalness, audio_features.speechiness та explicit. Щоб такі запити
// виконувалися ефективно, створіть складений індекс за цими полями та за допомогою explain()
// покажіть, що він використовується при виконанні пошуку.

db.runCommand({
    explain: {
        find: 'tracks',
        filter: {
            'audio_features.instrumentalness': {$gte: 0.5},
            'audio_features.speechiness': {$gte: 0.5},
            explicit: true
        }
    },
    verbosity: 'executionStats'
})

db.tracks.createIndex({
    'audio_features.instrumentalness': 1,
    'audio_features.speechiness': 1,
    explicit: 1
})

// Завдання 3. виконано в README.md
