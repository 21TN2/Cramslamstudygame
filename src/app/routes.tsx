import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import CreateGame from './pages/CreateGame';
import JoinGame from './pages/JoinGame';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Results from './pages/Results';

export const router = createBrowserRouter([
  { path: '/', Component: Home },
  { path: '/create', Component: CreateGame },
  { path: '/join', Component: JoinGame },
  { path: '/lobby', Component: Lobby },
  { path: '/game', Component: Game },
  { path: '/results', Component: Results },
]);
