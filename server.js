const express = require('express');
const app = express();

// JSON verilerini okuyabilmek için gövde ayrıştırıcı
app.use(express.json());

// In-Memory (Bellek İçi) Görev Deposu
let tasks = [
  {
    id: 1,
    title: 'Analiz ve Sistem Tasarımı',
    description: 'Veri modellerinin ve API mimarisinin planlanması',
    status: 'completed',
    priority: 'high',
    assignee: 'tugba'
  },
  {
    id: 2,
    title: 'REST API Uçlarının Geliştirilmesi',
    description: 'Express ile CRUD operasyonlarının yazılması',
    status: 'pending',
    priority: 'high',
    assignee: 'tugba'
  }
];

// Temel Middleware - Logger (Method, URL ve ISO Zaman Damgası)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// 1. Tüm Görevleri Listeleme (Filtreleme Destekli)
app.get('/tasks', (req, res) => {
  const { status, priority } = req.query;
  let results = [...tasks];

  if (status) {
    results = results.filter((t) => t.status.toLowerCase() === status.toLowerCase());
  }
  if (priority) {
    results = results.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
  }

  res.status(200).json({
    success: true,
    count: results.length,
    data: results
  });
});

// 2. Yeni Görev Ekleme
app.post('/tasks', (req, res) => {
  const { title, description, status, priority, assignee } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Hata: 'title' alanı zorunludur."
    });
  }

  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
    title,
    description: description || '',
    status: status || 'pending',
    priority: priority || 'medium',
    assignee: assignee || 'unassigned',
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json({
    success: true,
    message: 'Görev başarıyla eklendi.',
    data: newTask
  });
});

// 3. Belirli Bir Görevin Detayı
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({
      success: false,
      message: `ID: ${req.params.id} numaralı görev bulunamadı.`
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// 4. Görev Bilgilerini Güncelleme
app.put('/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `ID: ${req.params.id} numaralı görev bulunamadı.`
    });
  }

  tasks[index] = {
    ...tasks[index],
    ...req.body,
    id: Number(req.params.id) // ID'nin değişmesini engelle
  };

  res.status(200).json({
    success: true,
    message: 'Görev başarıyla güncellendi.',
    data: tasks[index]
  });
});

// 5. Görev Silme
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `ID: ${req.params.id} numaralı görev bulunamadı.`
    });
  }

  tasks.splice(index, 1);
  res.status(200).json({
    success: true,
    message: `ID: ${req.params.id} numaralı görev başarıyla silindi.`
  });
});

// 6. Raporlama Servisi (Özet Bilgiler)
app.get('/reports/summary', (req, res) => {
  const summary = {
    totalTasks: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status === 'pending').length
  };

  res.status(200).json({
    success: true,
    summary
  });
});

// Port Dinleme
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor.`);
});
