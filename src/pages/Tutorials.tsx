import { BookOpen, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const tutorials = [
  {
    title: "Portfólio",
    description: "Aprenda a criar e editar seu portfólio de jogador",
    url: "https://youtube.com/shorts/V585k87WnrU?si=S_dCCLbAQDmYTC_X",
    embedId: "V585k87WnrU",
    color: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-500/30",
  },
  {
    title: "Plano Nutricional",
    description: "Como gerar e acompanhar seu plano nutricional",
    url: "https://youtube.com/shorts/GTwo_DLLUw0?si=r-2zD-mw9rjEkfXa",
    embedId: "GTwo_DLLUw0",
    color: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30",
  },
  {
    title: "Treinos",
    description: "Como criar e completar seus treinos personalizados",
    url: "https://youtube.com/shorts/qs9_mEaE6QQ?si=XgBYmegRUHICYgHY",
    embedId: "qs9_mEaE6QQ",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
  },
  {
    title: "Calendário",
    description: "Como adicionar eventos e receber lembretes",
    url: "https://youtube.com/shorts/Rd3lCS3q9-A?si=TgvXS2C2qUCDvM00",
    embedId: "Rd3lCS3q9-A",
    color: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
  },
  {
    title: "Altura e Projeção",
    description: "Como usar a ferramenta de projeção de crescimento",
    url: "https://youtube.com/shorts/NLwnDPOaaAk?si=Rf5b761xl6gW1aHt",
    embedId: "NLwnDPOaaAk",
    color: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-500/30",
  },
];

export default function Tutorials() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pb-2">
        <div className="flex items-center justify-center gap-3 mb-1">
          <BookOpen className="h-7 w-7 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white">Tutoriais</h1>
        </div>
        <p className="text-yellow-400 font-medium text-base">
          Ficou com dúvida em alguma ferramenta do APP?
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Aqui abaixo estão todos os tutoriais passo a passo para melhor entendimento.
        </p>
      </div>

      {/* Tutorial Cards */}
      <div className="space-y-5">
        {tutorials.map((tutorial) => (
          <Card
            key={tutorial.title}
            className={`bg-gradient-to-br ${tutorial.color} border ${tutorial.border} overflow-hidden`}
          >
            <CardContent className="p-0">
              {/* Video Embed */}
              <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${tutorial.embedId}?rel=0&modestbranding=1`}
                  title={`Tutorial: ${tutorial.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Info */}
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{tutorial.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{tutorial.description}</p>
                </div>
                <a
                  href={tutorial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors mt-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Abrir</span>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer spacing */}
      <div className="h-4" />
    </div>
  );
}
