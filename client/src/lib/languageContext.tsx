
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';
type Theme = 'dark' | 'normal' | 'light';
type StyleMode = 'hacker' | 'futurista' | 'retro';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  styleMode: StyleMode;
  setStyleMode: (mode: StyleMode) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Join Screen
    'neuroLink': 'NEURO-LINK',
    'protocolZero': 'PROTOCOL ZERO',
    'gameDescription': 'A P2P CYBERPUNK SOCIAL DEDUCTION GAME',
    'hostGame': 'HOST GAME',
    'joinGame': 'JOIN GAME',
    'hostNewGame': 'HOST NEW GAME',
    'playerName': 'PLAYER NAME',
    'enterYourName': 'ENTER YOUR NAME',
    'create': 'CREATE',
    'back': 'BACK',
    'joinExistingGame': 'JOIN EXISTING GAME',
    'roomCode': 'ROOM CODE',
    'enterRoomCode': 'ENTER ROOM CODE',
    'join': 'JOIN',
    'theme': 'THEME',
    'themeDark': 'DARK',
    'themeNormal': 'NORMAL',
    'themeLight': 'LIGHT',
    'language': 'LANGUAGE',
    'styleMode': 'STYLE',
    'styleModeHacker': 'HACKER',
    'styleModeFuturista': 'FUTURISTA',
    'styleModeRetro': 'RETRO',
    
    // Lobby Screen
    'connectedUsers': 'CONNECTED USERS',
    'playersCount': 'PLAYERS',
    'hostSettings': 'HOST SETTINGS',
    'playOnThisDevice': 'PLAY ON THIS DEVICE',
    'initiateProtocol': 'INITIATE PROTOCOL',
    'minimumPlayers': 'MINIMUM 3 PLAYERS REQUIRED',
    
    // Role Reveal
    'youAreImpostor': 'YOU ARE THE IMPOSTOR',
    'findTheWord': 'FIND THE WORD',
    'youAreHacker': 'YOU ARE A HACKER',
    'secretWord': 'SECRET WORD',
    'category': 'CATEGORY',
    'decrypting': 'DECRYPTING...',
    'error': 'ERROR',
    'signalLost': 'SIGNAL LOST',
    'yourRole': 'YOUR ROLE',
    'impostor': 'IMPOSTOR',
    'yourWordIs': 'YOUR WORD IS',
    'describeWord': 'DESCRIBE THIS WORD WITHOUT SAYING IT. FIND THE IMPOSTOR WHO DOESN\'T KNOW IT.',
    
    // Gameplay
    'protocolActive': 'PROTOCOL ACTIVE',
    'yourTurn': 'YOUR TURN',
    'giveYourClue': 'GIVE YOUR CLUE NOW',
    'activePlayer': 'ACTIVE PLAYER',
    'timeRemaining': 'TIME',
    'endTurn': 'END TURN',
    'noiseBomb': 'NOISE BOMB',
    'chat': 'CHAT',
    'typeMessage': 'TYPE MESSAGE...',
    'send': 'SEND',
    'submitClue': 'SUBMIT CLUE (1-3 WORDS)',
    'enterClue': 'Enter clue...',
    'connectedUsers': 'CONNECTED USERS',
    'wordBanned': 'WORD BANNED',
    'secretWordCard': 'SECRET WORD',
    'yourRoleCard': 'YOUR ROLE',
    
    // Voting
    'voteToEliminate': 'VOTE TO ELIMINATE',
    'selectSuspectedImpostor': 'SELECT THE SUSPECTED IMPOSTOR',
    'players': 'PLAYERS',
    'waitingForPlayers': 'WAITING FOR OTHER PLAYERS...',
    'voted': 'VOTED',
    'mandatoryVoting': 'MANDATORY VOTING',
    'chooseWhoToEliminate': 'CHOOSE WHO TO ELIMINATE',
    
    // Game Over
    'hackersWin': 'HACKERS WIN',
    'impostorWins': 'IMPOSTOR WINS',
    'theImpostorWas': 'THE IMPOSTOR WAS',
    'playAgain': 'PLAY AGAIN',
    'backToLobby': 'BACK TO LOBBY',
    
    // Voting Results
    'votingResults': 'VOTING RESULTS',
    'tieNoElimination': 'TIE - NO ONE ELIMINATED',
    'eliminated': 'ELIMINATED',
    'votedBy': 'VOTED BY',
    'continuingGame': 'CONTINUING GAME',
    'backToGameplay': 'BACK TO GAMEPLAY',
    'votingFrequency': 'VOTING FREQUENCY',
    'everyRound': 'EVERY ROUND',
    'every2Rounds': 'EVERY 2 ROUNDS',
    'every3Rounds': 'EVERY 3 ROUNDS',
  },
  es: {
    // Join Screen
    'neuroLink': 'NEURO-LINK',
    'protocolZero': 'PROTOCOLO CERO',
    'gameDescription': 'UN JUEGO P2P CYBERPUNK DE DEDUCCIÓN SOCIAL',
    'hostGame': 'CREAR PARTIDA',
    'joinGame': 'UNIRSE A PARTIDA',
    'hostNewGame': 'CREAR NUEVA PARTIDA',
    'playerName': 'NOMBRE DE JUGADOR',
    'enterYourName': 'INTRODUCE TU NOMBRE',
    'create': 'CREAR',
    'back': 'ATRÁS',
    'joinExistingGame': 'UNIRSE A PARTIDA EXISTENTE',
    'roomCode': 'CÓDIGO DE SALA',
    'enterRoomCode': 'INTRODUCE CÓDIGO',
    'join': 'UNIRSE',
    'theme': 'TEMA',
    'themeDark': 'OSCURO',
    'themeNormal': 'NORMAL',
    'themeLight': 'CLARO',
    'language': 'IDIOMA',
    'styleMode': 'ESTILO',
    'styleModeHacker': 'HACKER',
    'styleModeFuturista': 'FUTURISTA',
    'styleModeRetro': 'RETRO',
    
    // Lobby Screen
    'connectedUsers': 'USUARIOS CONECTADOS',
    'playersCount': 'JUGADORES',
    'hostSettings': 'AJUSTES DE ANFITRIÓN',
    'playOnThisDevice': 'JUGAR EN ESTE DISPOSITIVO',
    'initiateProtocol': 'INICIAR PROTOCOLO',
    'minimumPlayers': 'MÍNIMO 3 JUGADORES REQUERIDOS',
    
    // Role Reveal
    'youAreImpostor': 'ERES EL IMPOSTOR',
    'findTheWord': 'ENCUENTRA LA PALABRA',
    'youAreHacker': 'ERES UN HACKER',
    'secretWord': 'PALABRA SECRETA',
    'category': 'CATEGORÍA',
    'decrypting': 'DESCIFRANDO...',
    'error': 'ERROR',
    'signalLost': 'SEÑAL PERDIDA',
    'yourRole': 'TU ROL',
    'impostor': 'IMPOSTOR',
    'yourWordIs': 'TU PALABRA ES',
    'describeWord': 'DESCRIBE ESTA PALABRA SIN DECIRLA. ENCUENTRA AL IMPOSTOR QUE NO LA CONOCE.',
    
    // Gameplay
    'protocolActive': 'PROTOCOLO ACTIVO',
    'yourTurn': 'TU TURNO',
    'giveYourClue': 'DA TU PISTA AHORA',
    'activePlayer': 'JUGADOR ACTIVO',
    'timeRemaining': 'TIEMPO',
    'endTurn': 'TERMINAR TURNO',
    'noiseBomb': 'BOMBA DE RUIDO',
    'chat': 'CHAT',
    'typeMessage': 'ESCRIBE MENSAJE...',
    'send': 'ENVIAR',
    'submitClue': 'ENVIAR PISTA (1-3 PALABRAS)',
    'enterClue': 'Introduce pista...',
    'connectedUsers': 'USUARIOS CONECTADOS',
    'wordBanned': 'PALABRA PROHIBIDA',
    'secretWordCard': 'PALABRA SECRETA',
    'yourRoleCard': 'TU ROL',
    
    // Voting
    'voteToEliminate': 'VOTA PARA EXPULSAR',
    'selectSuspectedImpostor': 'ELIGE AL IMPOSTOR SOSPECHOSO',
    'players': 'JUGADORES',
    'waitingForPlayers': 'ESPERANDO A OTROS JUGADORES...',
    'voted': 'VOTADO',
    'mandatoryVoting': 'VOTACIÓN OBLIGATORIA',
    'chooseWhoToEliminate': 'ELIGE A QUIÉN EXPULSAR',
    
    // Game Over
    'hackersWin': 'GANAN LOS HACKERS',
    'impostorWins': 'GANA EL IMPOSTOR',
    'theImpostorWas': 'EL IMPOSTOR ERA',
    'playAgain': 'JUGAR DE NUEVO',
    'backToLobby': 'VOLVER AL LOBBY',
    
    // Voting Results
    'votingResults': 'RESULTADOS DE VOTACIÓN',
    'tieNoElimination': 'EMPATE - NADIE EXPULSADO',
    'eliminated': 'EXPULSADO',
    'votedBy': 'VOTADO POR',
    'continuingGame': 'CONTINUANDO JUEGO',
    'backToGameplay': 'VUELTA AL JUEGO',
    'votingFrequency': 'FRECUENCIA DE VOTACIÓN',
    'everyRound': 'CADA RONDA',
    'every2Rounds': 'CADA 2 RONDAS',
    'every3Rounds': 'CADA 3 RONDAS',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'es' ? 'es' : 'en') as Language;
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'normal' || saved === 'light' ? saved : 'dark') as Theme;
  });

  const [styleMode, setStyleModeState] = useState<StyleMode>(() => {
    const saved = localStorage.getItem('styleMode');
    return (saved === 'futurista' || saved === 'retro' ? saved : 'hacker') as StyleMode;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('styleMode', styleMode);
    document.documentElement.setAttribute('data-style', styleMode);
  }, [styleMode]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setStyleMode = (mode: StyleMode) => {
    setStyleModeState(mode);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, theme, setTheme, styleMode, setStyleMode, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
