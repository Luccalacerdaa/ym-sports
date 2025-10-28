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
}

export const MapRanking = ({ className }: MapRankingProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
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
          window.mapboxgl.accessToken = 'pk.eyJ1IjoibHVjY2FsYWNlcmRhYSIsImEiOiJjbHVwZWo1eGUwMHNlMmpwYzNkb3FxcTVwIn0.4GyQX6Lz3-Qg7Bh5xJFdJw'; // Token público do Mapbox (atualizado)
          initializeMap();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Erro ao carregar Mapbox:', error);
      }
    };

    loadMapbox();
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !window.mapboxgl) return;

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-47.8825, -15.7942], // Centro do Brasil
      zoom: 4,
      projection: 'mercator'
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      addRegionalMarkers();
    });

    // Adicionar controles de navegação
    map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
  };

  const addRegionalMarkers = () => {
    if (!map.current || !mapLoaded) return;

    // Limpar marcadores existentes
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    let rankingsToShow: any[] = [];
    
    switch (selectedRegion) {
      case 'national':
        rankingsToShow = nationalRanking.slice(0, 10);
        break;
      case 'regional':
        rankingsToShow = regionalRanking.slice(0, 10);
        break;
      case 'local':
        rankingsToShow = localRanking.slice(0, 10);
        break;
      default:
        rankingsToShow = [
          ...nationalRanking.slice(0, 5),
          ...regionalRanking.slice(0, 5),
          ...localRanking.slice(0, 5)
        ];
    }

    rankingsToShow.forEach((athlete, index) => {
      let coordinates: [number, number];
      
      // Determinar coordenadas baseado no tipo de ranking
      if (athlete.ranking_type === 'national') {
        // Para ranking nacional, usar coordenadas das capitais dos estados com mais atletas
        const topStates = ['SP', 'RJ', 'MG', 'RS', 'PR'];
        const stateIndex = index % topStates.length;
        coordinates = stateCoordinates[topStates[stateIndex]];
      } else if (athlete.ranking_type === 'regional') {
        // Para ranking regional, usar coordenadas da região
        coordinates = regionCoordinates[athlete.region] || [-47.8825, -15.7942];
      } else {
        // Para ranking local, usar coordenadas do estado
        coordinates = stateCoordinates[athlete.region] || [-47.8825, -15.7942];
      }

      // Criar elemento do marcador
      const el = document.createElement('div');
      el.className = 'athlete-marker';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${index < 3 ? 
          (index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
           index === 1 ? 'linear-gradient(135deg, #C0C0C0, #808080)' :
           'linear-gradient(135deg, #CD7F32, #8B4513)') :
          'linear-gradient(135deg, #4F46E5, #7C3AED)'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.2s ease;
      `;
      
      el.innerHTML = `#${index + 1}`;
      
      // Adicionar hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Criar popup
      const popup = new window.mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              ${athlete.user_avatar ? 
                `<img src="${athlete.user_avatar}" alt="${athlete.user_name}" class="w-12 h-12 rounded-full object-cover" />` :
                `<span class="text-primary font-bold text-lg">${athlete.user_name?.charAt(0) || 'U'}</span>`
              }
            </div>
            <div>
              <h3 class="font-semibold">${athlete.user_name}</h3>
              <p class="text-sm text-muted-foreground">${athlete.user_location || 'Brasil'}</p>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm">Posição:</span>
              <Badge variant="outline">#${athlete.position}</Badge>
            </div>
            <div class="flex justify-between">
              <span class="text-sm">Pontos:</span>
              <span class="font-semibold text-primary">${athlete.total_points.toLocaleString()}</span>
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
