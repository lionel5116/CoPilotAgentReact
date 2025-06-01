import logo from './logo.svg';
import './App.css';
import ChatAgent from './DirectLineBotChat';
import SimpleBotChat from './SimpleBotChat';
import BotFrameworkChat from './BotFrameworkChat';
import CoPilotChat from './CoPilotChat';
import NavbarMain from './NavbarMain';
import { Route, Routes, HashRouter } from 'react-router-dom'

function App() {
  return (
    <div id="MasterContainer">
        <HashRouter>
          <NavbarMain />
          <Routes>
            <Route path="/" element={<SimpleBotChat />}></Route>
            <Route path="/SimpleBotChat" element={<SimpleBotChat />}></Route> 
            <Route path="/ChatAgent" element={<ChatAgent />}></Route>
            <Route path="/BotFrameworkChat" element={<BotFrameworkChat />}></Route>
            <Route path="/CoPilotChat" element={<CoPilotChat />}></Route>
          </Routes>
        </HashRouter>
      </div>
  );
}

export default App;
