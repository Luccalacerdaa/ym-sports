import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRanking } from '@/hooks/useRanking';
import { MapPin, Trophy, Users, Target, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Tipos para Mapbox
declare global {
  interface Window {
    mapboxgl: any;
  }
}

interface MapRankingProps {
  className?: string;
  rankingType?: 'national' | 'regional' | 'local';
}

export const MapRanking = ({ className, rankingType = 'all' }: MapRankingProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>(rankingType || 'all');
  const [mapStyle, setMapStyle] = useState<string>('streets');
  const { nationalRanking, regionalRanking, localRanking, userLocation } = useRanking();

  // Estados brasileiros com coordenadas aproximadas
  const stateCoordinates: { [key: string]: [number, number] } = {
    'AC': [-70.5, -9.0], 'AL': [-36.5, -9.5], 'AP': [-51.0, 1.0], 'AM': [-60.0, -3.0],
    'BA': [-42.0, -12.5], 'CE': [-39.0, -5.0], 'DF': [-47.9, -15.8], 'ES': [-40.5, -19.5],
    'GO': [-49.5, -16.0], 'MA': [-45.0, -5.0], 'MT': [-56.0, -12.5], 'MS': [-54.5, -20.5],
    'MG': [-44.0, -18.5], 'PA': [-52.0, -3.5], 'PB': [-36.5, -7.0], 'PR': [-51.5, -24.5],
    'PE': [-37.5, -8.5], 'PI': [-42.5, -8.0], 'RJ': [-43.0, -22.5], 'RN': [-36.0, -5.5],
    'RS': [-52.0, -30.0], 'RO': [-63.5, -10.5], 'RR': [-61.5, 2.0], 'SC': [-49.5, -27.5],
    'SP': [-46.5, -23.5], 'SE': [-37.0, -10.5], 'TO': [-48.0, -10.0]
  };

  // Coordenadas das regiões
  const regionCoordinates: { [key: string]: [number, number] } = {
    'Norte': [-60.0, -3.0],
    'Nordeste': [-42.0, -8.0],
    'Centro-Oeste': [-54.0, -15.0],
    'Sudeste': [-45.0, -20.0],
    'Sul': [-51.0, -27.0]
  };

  // Carregar Mapbox dinamicamente
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        // Carregar CSS do Mapbox
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Carregar JavaScript do Mapbox
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
        script.async = true;
        script.onload = () => {
          window.mapboxgl.accessToken = 'pk.eyJ1IjoibHVjY2FsYWNlcmRhYSIsImEiOiJjbTh6YXplYTEwMmJxMmpvbWh4bW1mOWY2In0.75keYWvJ5tU7KW6f7HZ1vg'; // Token público do Mapbox (token personalizado)
          initializeMap();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Erro ao carregar Mapbox:', error);
      }
    };

    loadMapbox();
  }, []);
  
  // Atualizar marcadores quando os dados de ranking mudarem
  useEffect(() => {
    if (mapLoaded && map.current) {
      console.log('Atualizando marcadores devido a mudanças nos dados de ranking');
      console.log(`Rankings disponíveis - Nacional: ${nationalRanking.length}, Regional: ${regionalRanking.length}, Local: ${localRanking.length}`);
      
      // Forçar atualização dos marcadores
      addRegionalMarkers();
    }
  }, [nationalRanking, regionalRanking, localRanking, mapLoaded, rankingType]);

  const initializeMap = () => {
    if (!mapContainer.current || !window.mapboxgl) return;

    // Determinar centro e zoom com base no tipo de ranking
    let center = [-47.8825, -15.7942]; // Centro do Brasil (padrão)
    let zoom = 4; // Zoom padrão para visualização nacional

    // Ajustar centro e zoom com base no tipo de ranking e localização do usuário
    if (selectedRegion === 'regional' && userLocation) {
      // Para visualização regional, centralizar na região do usuário
      const regionCenter = regionCoordinates[userLocation.region];
      if (regionCenter) {
        center = regionCenter;
        zoom = 5; // Zoom mais aproximado para região
      }
    } else if (selectedRegion === 'local' && userLocation) {
      // Para visualização local, centralizar no estado do usuário
      const stateCenter = stateCoordinates[userLocation.state];
      if (stateCenter) {
        center = stateCenter;
        zoom = 7; // Zoom mais aproximado para visualização local (60km)
      }
    }

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom,
      projection: 'mercator'
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      addRegionalMarkers();
      
      // Adicionar círculo de 60km para visualização local
      if (selectedRegion === 'local' && userLocation && userLocation.latitude_approximate && userLocation.longitude_approximate) {
        try {
          map.current.addSource('local-radius', {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [userLocation.longitude_approximate, userLocation.latitude_approximate]
              },
              'properties': {}
            }
          });
          
          map.current.addLayer({
            'id': 'local-radius-layer',
            'type': 'circle',
            'source': 'local-radius',
            'paint': {
              'circle-radius': {
                'stops': [
                  [0, 0],
                  [7, 60 * 1000 / 111320], // 60km em graus aproximadamente
                  [10, 60 * 1000 / 11132], // Ajuste de escala para diferentes níveis de zoom
                  [15, 60 * 1000 / 1113.2]
                ],
                'base': 2
              },
              'circle-color': 'rgba(255, 107, 0, 0.1)',
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255, 107, 0, 0.5)'
            }
          });
        } catch (error) {
          console.error("Erro ao adicionar círculo de raio local:", error);
        }
      }
    });

    // Adicionar controles de navegação
    map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
  };

  const addRegionalMarkers = () => {
    if (!map.current || !mapLoaded) return;

    // Limpar marcadores existentes
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Limpar camadas existentes
    if (map.current.getLayer('local-radius-layer')) {
      map.current.removeLayer('local-radius-layer');
    }
    if (map.current.getSource('local-radius')) {
      map.current.removeSource('local-radius');
    }

    let rankingsToShow: any[] = [];
    
    // Selecionar rankings com base no tipo
    switch (selectedRegion) {
      case 'national':
        rankingsToShow = nationalRanking.slice(0, 20); // Mostrar mais jogadores
        break;
      case 'regional':
        rankingsToShow = regionalRanking.slice(0, 15); // Mostrar mais jogadores regionais
        break;
      case 'local':
        rankingsToShow = localRanking.slice(0, 15); // Mostrar mais jogadores locais
        break;
      default:
        // Combinação de todos os rankings
        rankingsToShow = [
          ...nationalRanking.slice(0, 5),
          ...regionalRanking.slice(0, 5),
          ...localRanking.slice(0, 5)
        ];
    }

    // Adicionar círculo de 60km para visualização local
    if (selectedRegion === 'local' && userLocation && userLocation.latitude_approximate && userLocation.longitude_approximate) {
      try {
        map.current.addSource('local-radius', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [userLocation.longitude_approximate, userLocation.latitude_approximate]
            },
            'properties': {}
          }
        });
        
        map.current.addLayer({
          'id': 'local-radius-layer',
          'type': 'circle',
          'source': 'local-radius',
          'paint': {
            'circle-radius': {
              'stops': [
                [0, 0],
                [7, 60 * 1000 / 111320], // 60km em graus aproximadamente
                [10, 60 * 1000 / 11132], // Ajuste de escala para diferentes níveis de zoom
                [15, 60 * 1000 / 1113.2]
              ],
              'base': 2
            },
            'circle-color': 'rgba(255, 107, 0, 0.1)',
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255, 107, 0, 0.5)'
          }
        });
      } catch (error) {
        console.error("Erro ao adicionar círculo de raio local:", error);
      }
    }

    // Log para debug
    console.log(`Exibindo ${rankingsToShow.length} jogadores no mapa (${selectedRegion})`);
    console.log('Amostra de jogadores:', rankingsToShow.slice(0, 3));
    
    // Se não houver jogadores para mostrar, adicionar jogadores fictícios para teste
    if (rankingsToShow.length === 0) {
      console.log('Nenhum jogador encontrado. Adicionando jogadores fictícios para teste...');
      
      // Criar alguns jogadores fictícios para teste
      const dummyPlayers = [
        {
          user_id: 'dummy1',
          user_name: 'Jogador Teste 1',
          position: 1,
          total_points: 1000,
          ranking_type: selectedRegion === 'all' ? 'national' : selectedRegion,
          region: userLocation?.region || 'Sudeste'
        },
        {
          user_id: 'dummy2',
          user_name: 'Jogador Teste 2',
          position: 2,
          total_points: 800,
          ranking_type: selectedRegion === 'all' ? 'national' : selectedRegion,
          region: userLocation?.region || 'Sudeste'
        }
      ];
      
      rankingsToShow = dummyPlayers;
    }
    
    // Adicionar marcadores para cada atleta
    rankingsToShow.forEach((athlete, index) => {
      // Verificar se o atleta tem dados completos
      if (!athlete || !athlete.user_id) {
        console.log("Atleta sem dados completos:", athlete);
        return; // Pular este atleta
      }
      
      // Log para debug de cada jogador
      console.log(`Adicionando marcador para ${athlete.user_name || 'Usuário'} (#${athlete.position})`);
      

      let coordinates: [number, number];
      let jitter = 0.05; // Adicionar um pequeno deslocamento aleatório para evitar sobreposição
      
      // Determinar coordenadas baseado no tipo de ranking
      if (athlete.ranking_type === 'national' || selectedRegion === 'national') {
        // Para ranking nacional, usar coordenadas das capitais dos estados com mais atletas
        const topStates = ['SP', 'RJ', 'MG', 'RS', 'PR', 'BA', 'SC', 'PE', 'CE', 'GO'];
        const stateIndex = index % topStates.length;
        const baseCoords = stateCoordinates[topStates[stateIndex]];
        
        if (baseCoords) {
          // Adicionar pequena variação para evitar sobreposição
          coordinates = [
            baseCoords[0] + (Math.random() - 0.5) * jitter,
            baseCoords[1] + (Math.random() - 0.5) * jitter
          ];
        } else {
          coordinates = [-47.8825 + (Math.random() - 0.5) * jitter, -15.7942 + (Math.random() - 0.5) * jitter];
        }
      } else if (athlete.ranking_type === 'regional' || selectedRegion === 'regional') {
        // Para ranking regional, usar coordenadas da região
        const baseCoords = regionCoordinates[athlete.region];
        if (baseCoords) {
          coordinates = [
            baseCoords[0] + (Math.random() - 0.5) * jitter,
            baseCoords[1] + (Math.random() - 0.5) * jitter
          ];
        } else {
          coordinates = [-47.8825 + (Math.random() - 0.5) * jitter, -15.7942 + (Math.random() - 0.5) * jitter];
        }
      } else {
        // Para ranking local, usar coordenadas do estado
        const baseCoords = stateCoordinates[athlete.region];
        if (baseCoords) {
          coordinates = [
            baseCoords[0] + (Math.random() - 0.5) * jitter,
            baseCoords[1] + (Math.random() - 0.5) * jitter
          ];
        } else {
          coordinates = [-47.8825 + (Math.random() - 0.5) * jitter, -15.7942 + (Math.random() - 0.5) * jitter];
        }
      }

      // Criar elemento do marcador
      const el = document.createElement('div');
      el.className = 'athlete-marker';
      
      // Determinar o estilo do marcador com base na posição
      const position = athlete.position || index + 1;
      
      el.style.cssText = `
        width: ${position === 1 ? 50 : position === 2 ? 45 : position === 3 ? 40 : 35}px;
        height: ${position === 1 ? 50 : position === 2 ? 45 : position === 3 ? 40 : 35}px;
        border-radius: 50%;
        background: ${position === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                    position === 2 ? 'linear-gradient(135deg, #E0E0E0, #A9A9A9)' :
                    position === 3 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' :
                    'linear-gradient(135deg, #FF6B00, #E05600)'};
        border: ${position <= 3 ? 3 : 2}px solid ${position === 1 ? '#FFD700' : 
                                                  position === 2 ? '#C0C0C0' : 
                                                  position === 3 ? '#CD7F32' : 'white'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: ${position === 1 ? 18 : position === 2 ? 16 : position === 3 ? 14 : 12}px;
        cursor: pointer;
        transition: transform 0.2s ease;
        z-index: ${100 - position};
      `;
      
      el.innerHTML = `${position}`;
      
      // Adicionar hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Criar popup com informações detalhadas do jogador
      const popup = new window.mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px'
      }).setHTML(`
        <div class="p-4 min-w-[250px] max-w-[300px]">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 ${
              position === 1 ? 'border-amber-400' : 
              position === 2 ? 'border-slate-300' : 
              position === 3 ? 'border-amber-700' : 'border-primary'
            }">
              ${athlete.user_avatar ? 
                `<img src="${athlete.user_avatar}" alt="${athlete.user_name || 'Atleta'}" class="w-16 h-16 rounded-full object-cover" />` :
                `<span class="text-primary font-bold text-xl">${(athlete.user_name || 'A')[0]}</span>`
              }
            </div>
            <div>
              <h3 class="font-bold text-lg">${athlete.user_name || 'Atleta'}</h3>
              <p class="text-sm text-muted-foreground">${athlete.user_location || 'Brasil'}</p>
              <div class="flex items-center gap-1 mt-1">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full ${
                  position === 1 ? 'bg-amber-400' : 
                  position === 2 ? 'bg-slate-300' : 
                  position === 3 ? 'bg-amber-700' : 'bg-primary'
                } text-white text-xs font-bold">${position}</span>
                <span class="text-xs text-muted-foreground">
                  ${athlete.ranking_type === 'national' ? 'Ranking Nacional' : 
                    athlete.ranking_type === 'regional' ? `Ranking Regional` : 
                    `Ranking Local`}
                </span>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center bg-primary/10 p-3 rounded-md">
              <div class="flex flex-col">
                <span class="text-xs text-muted-foreground">Posição</span>
                <span class="font-bold text-lg ${
                  position === 1 ? 'text-amber-400' : 
                  position === 2 ? 'text-slate-300' : 
                  position === 3 ? 'text-amber-700' : 'text-primary'
                }">#${position}</span>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-xs text-muted-foreground">Pontuação</span>
                <span class="font-bold text-lg">${athlete.total_points?.toLocaleString() || '0'}</span>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-sm">Ranking:</span>
              <Badge variant="secondary">
                ${athlete.ranking_type === 'national' ? 'Nacional' :
                 athlete.ranking_type === 'regional' ? 'Regional' : 'Local'}
              </Badge>
            </div>
          </div>
        </div>
      `);

      // Adicionar marcador ao mapa
      new window.mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current);
    });

    // Destacar localização do usuário se configurada
    if (userLocation && stateCoordinates[userLocation.state]) {
      const userCoordinates = stateCoordinates[userLocation.state];
      
      const userEl = document.createElement('div');
      userEl.className = 'user-location-marker';
      userEl.style.cssText = `
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10B981, #059669);
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
        z-index: 1000;
      `;
      
      // Adicionar CSS para animação pulse
      if (!document.getElementById('pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
          @keyframes pulse {
            0% { 
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6), 0 0 0 0 rgba(16, 185, 129, 0.7); 
            }
            70% { 
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6), 0 0 0 15px rgba(16, 185, 129, 0); 
            }
            100% { 
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6), 0 0 0 0 rgba(16, 185, 129, 0); 
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      userEl.innerHTML = '🏠';

      const userPopup = new window.mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span class="text-green-600 font-bold text-lg">🏠</span>
            </div>
            <div>
              <h3 class="font-semibold text-green-600">Você está aqui!</h3>
              <p class="text-sm text-muted-foreground">${userLocation.state} - ${userLocation.region}</p>
            </div>
          </div>
          <div class="space-y-2">
            <div class="text-sm">
              <span class="font-medium">Jogadores próximos:</span>
              <span class="text-green-600 font-semibold">${rankingsToShow.length}</span>
            </div>
            <div class="text-xs text-muted-foreground">
              Veja outros atletas da sua região competindo!
            </div>
          </div>
        </div>
      `);

      new window.mapboxgl.Marker(userEl)
        .setLngLat(userCoordinates)
        .setPopup(userPopup)
        .addTo(map.current);

      // Focar no usuário se for o primeiro carregamento
      if (selectedRegion === 'all') {
        map.current.flyTo({
          center: userCoordinates,
          zoom: 6,
          duration: 1000
        });
      }
    }
  };

  // Recriar marcadores quando rankings ou região selecionada mudarem
  useEffect(() => {
    if (mapLoaded) {
      addRegionalMarkers();
    }
  }, [mapLoaded, nationalRanking, regionalRanking, localRanking, selectedRegion, userLocation]);

  const handleStyleChange = (style: string) => {
    if (!map.current) return;
    
    const styleMap: { [key: string]: string } = {
      'streets': 'mapbox://styles/mapbox/streets-v11',
      'satellite': 'mapbox://styles/mapbox/satellite-streets-v11',
      'light': 'mapbox://styles/mapbox/light-v10',
      'dark': 'mapbox://styles/mapbox/dark-v10'
    };
    
    map.current.setStyle(styleMap[style] || styleMap.streets);
    setMapStyle(style);
  };

  const handleZoomToBrazil = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: [-47.8825, -15.7942],
      zoom: 4,
      duration: 1000
    });
  };

  const handleZoomToUser = () => {
    if (!map.current || !userLocation) return;
    
    const userCoordinates = stateCoordinates[userLocation.state];
    if (userCoordinates) {
      map.current.flyTo({
        center: userCoordinates,
        zoom: 7,
        duration: 1000
      });
    }
  };

  const handleZoomIn = () => {
    if (!map.current) return;
    map.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!map.current) return;
    map.current.zoomOut();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controles do Mapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Mapa de Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filtro:</span>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="national">Nacional</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estilo:</span>
              <Select value={mapStyle} onValueChange={handleStyleChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streets">Ruas</SelectItem>
                  <SelectItem value="satellite">Satélite</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomToBrazil}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Brasil
              </Button>
              {userLocation && (
                <Button size="sm" variant="outline" onClick={handleZoomToUser}>
                  <MapPin className="h-4 w-4 mr-1" />
                  Minha Localização
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <div 
              ref={mapContainer} 
              className="w-full h-96 rounded-lg"
              style={{ minHeight: '400px' }}
            />
            
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Carregando mapa...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"></div>
              <span className="text-sm">1º Lugar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-gray-300 to-gray-500"></div>
              <span className="text-sm">2º Lugar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-800"></div>
              <span className="text-sm">3º Lugar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <span className="text-sm">Outros</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
                <span className="text-sm">Sua Localização</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
