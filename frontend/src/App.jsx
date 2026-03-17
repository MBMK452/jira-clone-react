import { useStore } from './store/useStore';
import Login from './components/Login';
import Board from './components/Board';

function App() {
  const token = useStore((state) => state.token);
  return token ? <Board /> : <Login />;
}

export default App;