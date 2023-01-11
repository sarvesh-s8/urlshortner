import "./App.css";
import { Provider } from "react-redux";
import store from "./Redux/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
      <Routes>
        
      </Routes>
      </BrowserRouter>
      {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
    </Provider>
  );
}

export default App;
