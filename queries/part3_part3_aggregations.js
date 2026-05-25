// Завдання 1. Топ-10 виконавців за середньою популярністю
// Знайдіть виконавців, у яких є хоча б 5 треків. Для кожного виконавця порахуйте середню
// популярність його треків. Потім відсортуйте за спаданням та виберіть топ-10 виконавців. Вивід
// повинен включати ім’я виконавця та його середню популярність.

db.tracks.aggregate([
    {$group: {
        _id: '$artists',
        avg_popularity: {$avg: '$popularity'},
        count: {$sum: 1}
    }},

    {$match: {count: {$gte: 5}}},

    {$sort: {avg_popularity: -1}},

    {$project: {
        _id: 0,
        artist: '$_id',
        avg_popularity: 1
    }},

    {$limit: 10}
])

// Завдання 2. Розподіл треків за настроєм
// Кожному треку присвойте настрій на основі двох полів: valence (позитивність) та energy:
// високий valence + висока energy → happy
// низький valence + висока energy → angry
// високий valence + низька energy → calm
// низький valence + низька energy → sad 
// Порахуйте, скільки треків потрапило до кожної категорії, та виведіть таблицю з настроєм і кількістю треків.

db.tracks.aggregate([
    {
        $addFields: {
            mood: {
                $switch: {
                    branches: [
                        {case: 
                            {$and: [
                                {$gt: ['$audio_features.valence', 0.5]},
                                {$gt: ['$audio_features.energy', 0.5]}
                            ]}, then: 'happy'
                        },
                        {case: 
                            {$and: [
                                {$lt: ['$audio_features.valence', 0.5]},
                                {$gt: ['$audio_features.energy', 0.5]}
                            ]}, then: 'angry'
                        },
                        {case: 
                            {$and: [
                                {$gt: ['$audio_features.valence', 0.5]},
                                {$lt: ['$audio_features.energy', 0.5]}
                            ]}, then: 'calm'
                        }
                    ], default: 'sad'
                }
            }
        }
    },

    {
        $group: {
            _id: '$mood',
            count: {$sum: 1}
        }
    },

    {
        $project: {
            _id: 0,
            mood: '$_id',
            count: 1
        }
    }
])

// Завдання 3. Найбільш «танцювальний» жанр
// Визначте, який музичний жанр найкраще підходить для танців. Для цього згрупуйте треки за
// жанрами та обчисліть середні значення танцювальності (danceability), енергії (energy) та
// позитивності (valence).
// Відфільтруйте жанри, в яких налічується менше 100 треків, щоб забезпечити статистичну
// надійність. У результаті виведіть:
// назву жанру
// середню танцювальність (avg_danceability)
// середню енергію (avg_energy)
// середню позитивність (avg_valence)
// кількість треків у жанрі

db.tracks.aggregate([
    {
        $group: {
            _id: '$track_genre',
            avg_danceability: {$avg: '$audio_features.danceability'},
            avg_energy: {$avg: '$audio_features.energy'},
            avg_valence: {$avg: '$audio_features.valence'},
            count: {$sum: 1}
        }
    },

    {
        $match: {count: {$gte: 100}}
    },

    {
        $project: {
            _id: 0,
            genre: '$_id',
            avg_danceability: 1,
            avg_energy: 1,
            avg_valence: 1,
            count: 1
        }
    }
])
