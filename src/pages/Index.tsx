import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedShots, setRecognizedShots] = useState<Array<{id: number, text: string, duration: string, type: string, image?: string, tips?: string[], completed?: boolean}>>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const projects = [
    {
      id: 1,
      title: 'Летний влог',
      shots: 12,
      progress: 75,
      thumbnail: '🌅',
      status: 'В работе'
    },
    {
      id: 2,
      title: 'Интервью блогера',
      shots: 8,
      progress: 30,
      thumbnail: '🎤',
      status: 'Планирование'
    },
    {
      id: 3,
      title: 'Рекламный ролик',
      shots: 15,
      progress: 100,
      thumbnail: '🎬',
      status: 'Завершен'
    }
  ];

  const recentShots = [
    { id: 1, text: 'Открытие: панорама города с высоты птичьего полета', duration: '5 сек', type: 'Drone shot' },
    { id: 2, text: 'Крупный план: главный герой смотрит в камеру с улыбкой', duration: '3 сек', type: 'Close-up' },
    { id: 3, text: 'Средний план: группа друзей идет по улице в золотой час', duration: '8 сек', type: 'Medium shot' }
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ru-RU';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          const shotText = finalTranscript.trim();
          const newShot = {
            id: Date.now(),
            text: shotText,
            duration: '5 сек',
            type: 'Voice shot',
            tips: generateTips(shotText)
          };
          setRecognizedShots(prev => [newShot, ...prev]);
          generateImageForShot(newShot.id, shotText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleVoiceRecord = () => {
    if (!recognitionRef.current) {
      alert('Голосовое распознавание не поддерживается в вашем браузере. Используйте Chrome или Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setTranscript('');
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const generateTips = (shotText: string): string[] => {
    const tips = [];
    if (shotText.includes('крупн') || shotText.includes('close')) {
      tips.push('Фокус на глазах персонажа');
      tips.push('Используйте диафрагму f/2.8 или шире');
    }
    if (shotText.includes('высот') || shotText.includes('drone') || shotText.includes('дрон')) {
      tips.push('Проверьте разрешение на съемку');
      tips.push('Учитывайте погодные условия');
    }
    if (shotText.includes('движ') || shotText.includes('tracking')) {
      tips.push('Используйте стабилизатор или рельсы');
      tips.push('Плавность — залог качественного кадра');
    }
    if (tips.length === 0) {
      tips.push('Проверьте экспозицию перед съемкой');
      tips.push('Используйте естественное освещение');
    }
    return tips;
  };

  const generateImageForShot = async (shotId: number, description: string) => {
    setIsGeneratingImage(true);
    try {
      const prompt = `Black and white sketch storyboard drawing: ${description}. Simple pencil sketch style, minimal details, cinematic composition, clear focal point`;
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecognizedShots(prev => 
          prev.map(shot => 
            shot.id === shotId ? { ...shot, image: data.imageUrl } : shot
          )
        );
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      
      setTimeout(() => {
        const mockShots = [
          { id: Date.now() + 1, text: 'Вступительная сцена: камера медленно движется через городскую улицу', duration: '8 сек', type: 'Tracking shot', tips: ['Используйте стабилизатор', 'Плавное движение - ключ к успеху', 'Снимайте в золотой час'] },
          { id: Date.now() + 2, text: 'Крупный план: эмоциональная реакция главного героя', duration: '3 сек', type: 'Close-up', tips: ['Фокус на глазах', 'Естественное освещение', 'Минимум f/2.8'] },
          { id: Date.now() + 3, text: 'Общий план: панорама локации с высоты', duration: '6 сек', type: 'Wide shot', tips: ['Дрон или высокая точка', 'Следите за композицией', 'Учитывайте ветер'] },
          { id: Date.now() + 4, text: 'Средний план: диалог двух персонажей', duration: '12 сек', type: 'Medium shot', tips: ['Правило 180 градусов', 'Микрофон-петличка', 'Освещение на уровне глаз'] },
          { id: Date.now() + 5, text: 'Детальная съемка: крупный план объекта', duration: '4 сек', type: 'Detail shot', tips: ['Макро объектив', 'Контролируйте глубину резкости', 'Стабильная опора'] }
        ];
        mockShots.forEach(shot => {
          generateImageForShot(shot.id, shot.text);
        });
        setRecognizedShots(prev => [...mockShots, ...prev]);
        setIsAnalyzing(false);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Film" size={24} className="text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                Shot Desk.it
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant={activeSection === 'home' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('home')}
                className="gap-2"
              >
                <Icon name="Home" size={18} />
                Главная
              </Button>
              <Button
                variant={activeSection === 'projects' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('projects')}
                className="gap-2"
              >
                <Icon name="FolderOpen" size={18} />
                Проекты
              </Button>
              <Button
                variant={activeSection === 'profile' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('profile')}
                className="gap-2"
              >
                <Icon name="User" size={18} />
                Профиль
              </Button>
            </nav>

            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">ЮР</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'home' && (
          <div className="space-y-16 animate-fade-in">
            <section className="text-center space-y-6 py-12">
              <div className="inline-block animate-slide-up">
                <Badge variant="secondary" className="mb-4 text-sm px-4 py-2">
                  🎥 Для рилс и фильмейкеров
                </Badge>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold leading-tight animate-slide-up">
                Создавай раскадровки{' '}
                <span className="italic underline decoration-2">
                  голосом
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up">
                Записывай идеи для съемки на лету. Ничего не забудь и разнообрази свой контент с профессиональным
                подходом
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-slide-up">
                <Button
                  size="lg"
                  className="gap-2 text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 sketch-border"
                  onClick={handleVoiceRecord}
                >
                  <Icon name={isRecording ? 'StopCircle' : 'Mic'} size={24} />
                  {isRecording ? 'Остановить запись' : 'Начать запись'}
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                  <Icon name="Plus" size={24} />
                  Новый проект
                </Button>
              </div>

              {isRecording && (
                <div className="mt-6 animate-fade-in">
                  <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Идет запись...</span>
                    </div>
                    {transcript && (
                      <p className="text-sm text-muted-foreground mt-3 p-3 bg-muted rounded">{transcript}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                    <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h4 className="text-lg font-semibold mb-2">Загрузи видео для анализа</h4>
                    <p className="text-sm text-muted-foreground">Загрузи ролик или отрывок из фильма — мы извлечем раскадровки</p>
                  </div>
                </label>
              </div>

              {isAnalyzing && (
                <div className="mt-6 animate-fade-in">
                  <Card>
                    <CardContent className="py-8 text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg font-medium">Анализируем видео...</p>
                      <p className="text-sm text-muted-foreground mt-2">Извлекаем кадры и создаем раскадровку</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">Раскадровка</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{recognizedShots.filter(s => s.completed).length} / {recognizedShots.length} снято</span>
                </div>
              </div>

              {recognizedShots.length > 0 && (
                <Card className="border-2 border-primary/20 sketch-border overflow-hidden bg-card/30 backdrop-blur">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border bg-muted/30">
                        <tr>
                          <th className="text-left p-4 font-semibold w-12">✅</th>
                          <th className="text-left p-4 font-semibold w-20">№</th>
                          <th className="text-left p-4 font-semibold w-32">Превью</th>
                          <th className="text-left p-4 font-semibold">Описание кадра</th>
                          <th className="text-left p-4 font-semibold w-32">Тип</th>
                          <th className="text-left p-4 font-semibold w-24">Время</th>
                          <th className="text-left p-4 font-semibold w-64">Советы</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recognizedShots.map((shot, index) => (
                          <tr 
                            key={shot.id} 
                            className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                              shot.completed ? 'opacity-60' : ''
                            }`}
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={shot.completed || false}
                                onChange={() => {
                                  setRecognizedShots(prev => 
                                    prev.map(s => 
                                      s.id === shot.id ? { ...s, completed: !s.completed } : s
                                    )
                                  );
                                }}
                                className="w-5 h-5 rounded border-2 border-border cursor-pointer accent-primary"
                              />
                            </td>
                            <td className="p-4">
                              <span className="font-mono font-bold text-lg">{index + 1}</span>
                            </td>
                            <td className="p-4">
                              {shot.image ? (
                                <img 
                                  src={shot.image} 
                                  alt={`Кадр ${index + 1}`}
                                  className="w-24 h-16 object-cover rounded border border-border grayscale"
                                />
                              ) : (
                                <div className="w-24 h-16 bg-muted rounded border border-border flex items-center justify-center">
                                  <Icon name="Image" size={20} className="text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <p className={`text-sm leading-relaxed ${
                                shot.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}>
                                {shot.text}
                              </p>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="border-primary/50">
                                {shot.type}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-sm text-muted-foreground">
                                {shot.duration}
                              </span>
                            </td>
                            <td className="p-4">
                              {shot.tips && shot.tips.length > 0 && (
                                <div className="space-y-1">
                                  {shot.tips.map((tip, idx) => (
                                    <p key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                      <span className="text-primary mt-0.5">•</span>
                                      <span>{tip}</span>
                                    </p>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </section>

            <section className="border-2 border-primary/20 rounded-sm p-12 text-center space-y-4 sketch-border bg-card/30 backdrop-blur relative z-10">
              <Icon name="Sparkles" size={48} className="mx-auto text-primary" />
              <h3 className="text-3xl font-bold">Профессиональный подход к контенту</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Shot Desk.it помогает структурировать идеи, планировать съемки и создавать разнообразный контент без
                упущенных моментов
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8 text-left">
                <div className="border border-border/50 bg-background/50 backdrop-blur rounded-sm p-6 hover:border-primary/50 transition-colors">
                  <Icon name="Mic" size={32} className="mb-3 text-primary" />
                  <h4 className="font-bold text-lg mb-2">Голосовая запись</h4>
                  <p className="text-sm text-muted-foreground">Диктуй идеи на русском — система распознает и создаст раскадровки автоматически</p>
                </div>
                <div className="border border-border/50 bg-background/50 backdrop-blur rounded-sm p-6 hover:border-primary/50 transition-colors">
                  <Icon name="Video" size={32} className="mb-3 text-primary" />
                  <h4 className="font-bold text-lg mb-2">Анализ видео</h4>
                  <p className="text-sm text-muted-foreground">Загружай рилсы или отрывки из фильмов — мы извлечем структуру кадров</p>
                </div>
                <div className="border border-border/50 bg-background/50 backdrop-blur rounded-sm p-6 hover:border-primary/50 transition-colors">
                  <Icon name="Image" size={32} className="mb-3 text-primary" />
                  <h4 className="font-bold text-lg mb-2">AI-скетчи</h4>
                  <p className="text-sm text-muted-foreground">Каждый кадр получает визуальный скетч и советы по съемке</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">Мои проекты</h2>
                <p className="text-muted-foreground">Управляй своими съемками и раскадровками</p>
              </div>
              <Button className="gap-2">
                <Icon name="Plus" size={20} />
                Новый проект
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{project.thumbnail}</div>
                      <Badge
                        variant={project.status === 'Завершен' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription>Раскадровок: {project.shots}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Прогресс</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="ghost" className="flex-1 gap-1">
                        <Icon name="Eye" size={16} />
                        Открыть
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl">
                  ЮР
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold">Юрий Режиссеров</h2>
                <p className="text-muted-foreground">Фильмейкер и контент-креатор</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Icon name="Film" size={32} className="mx-auto mb-2 text-primary" />
                  <CardTitle className="text-3xl">23</CardTitle>
                  <CardDescription>Проектов</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Icon name="Camera" size={32} className="mx-auto mb-2 text-primary" />
                  <CardTitle className="text-3xl">156</CardTitle>
                  <CardDescription>Раскадровок</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Icon name="Clock" size={32} className="mx-auto mb-2 text-primary" />
                  <CardTitle className="text-3xl">42ч</CardTitle>
                  <CardDescription>Сэкономлено времени</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Settings" size={24} />
                  Настройки профиля
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Голосовой ввод</p>
                    <p className="text-sm text-muted-foreground">Распознавание русской речи</p>
                  </div>
                  <Badge variant="default">Активно</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Автосохранение</p>
                    <p className="text-sm text-muted-foreground">Сохранение каждые 30 секунд</p>
                  </div>
                  <Badge variant="default">Включено</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Тема оформления</p>
                    <p className="text-sm text-muted-foreground">Темная тема для комфортной работы</p>
                  </div>
                  <Badge variant="secondary">Темная</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-24 py-12 relative z-10">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-mono text-sm">Shot Desk.it © 2024 • Создавай лучший контент с профессиональным подходом</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;