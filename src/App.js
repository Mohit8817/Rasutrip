import './App.css';
import DealsSection from './Components/Deals/DealsSection';
import Header from './Components/header/Header';
import Slider from './Components/hero/Slider';

function App() {
  return (
    <div className="App">
      <Header />
      <Slider/>
<DealsSection/>
    </div>
  );
}

export default App;
