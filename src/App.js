import React, { useState, useRef } from 'react';
// import logo from './logo.svg';
import './App.css';
// import './polarity.js';

import Paper from '@material-ui/core/Paper';

// import Histogram from 'react-chart-histogram';
import {MuiThemeProvider} from '@material-ui/core/styles';
// import {TextField} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Plot from 'react-plotly.js';
import { CircularProgressbar, buildStyles, CircularProgressbarWithChildren, RadialSeparators} from 'react-circular-progressbar';
// import RadialSeparators from "./RadialSeparators";
import ProgressBar from 'react-bootstrap/ProgressBar'



function App() {


  const [translatedSentence, setTranslatedSentence] = useState('');
  const [polarity, setPolarity] = useState(null);
  const [polarityLabel, setPolarityLabel] = useState(null);
  const [mostCommonWords, setMostCommonWords] = useState(0);
  const [freqs, setFreqs] = useState(0);
  const [lexdiv, setLexdiv] = useState(0);
  const [svgPOStagging, setSvgPOStagging] = useState("<div></div>");
  const [svgNER, setSvgNER] = useState(null);
  const [listOfWords, setListOfWords] = useState(null);
  const [numOfSyns, setNumOfSyns] = useState(null);
  const [numOfAnts, setNumOfAnts] = useState(null);
  const [polarityScores, setPolarityScores] = useState(null);

  // const [freqInfo, setFreqInfo] = useState(null);


  const [writeMode, setWriteMode] = useState(false);


  const fieldRef = useRef();


  

  function analyze() {
    const url_translate = '/analyse/translate/'
    fetch(url_translate.concat(fieldRef.current.value))
    .then(res => res.json())
    .then(data => setTranslatedSentence(data["outputSentence"]));

    const url_sa = '/analyse/sentiment/'
    fetch(url_sa.concat(fieldRef.current.value))
    .then(res => res.json())
    .then(data => {
      setPolarity(data["score"]);
      setPolarityLabel(data["label"]);
      console.log(data["label"]);
    });

    const url_freq = "/analyse/freq/"
    fetch(url_freq.concat(fieldRef.current.value))
    .then(res => res.json())
    .then(data => {
      setMostCommonWords(data["most_common_words"]);
      setFreqs(data["freqs"]);
    });

    const url_lexdiv = "/analyse/lexdiv/"
    fetch(url_lexdiv.concat(fieldRef.current.value))
    .then(res => res.json())
    .then(data => setLexdiv(data["lexdiv_coef"]));
    
    const url_syn_and_ant = "/analyse/syn_and_ant/"
    fetch(url_syn_and_ant.concat(fieldRef.current.value))
    .then(res => res.json())
    .then(data => {
      setListOfWords(data["list_of_words"]);
      setNumOfSyns(data["n_synonyms"]);
      setNumOfAnts(data["n_antonyms"]);
    });

    const url_pos = "/analyse/pos_tagging/"
    fetch(url_pos.concat(fieldRef.current.value))
    .then(res => res.json())
    .then(data => setSvgPOStagging(data["html_code"]));

    var tag_id = document.getElementById('pos');
    tag_id.innerHTML = svgPOStagging;

    const url_ner = "/analyse/ner/"
    fetch(url_ner.concat(fieldRef.current.value))
    .then(res => res.json())
    .then(data => setSvgNER(data["html_code"]));

    var tag_id_ner = document.getElementById('ner');
    tag_id_ner.innerHTML = svgNER;

    // var sumOfSynsAndAnts = numOfSyns.map(function (num, idx) {
    //   return num + numOfAnts[idx];
    // });
    // console.log(sumOfSynsAndAnts);

    setWriteMode(true);
  }  

   

  


  const green = Math.round((polarity + 1) * 128);
  const red = 255 - green;
  const textColor = {

    backgroundColor: 'rgb(' + red + ', ' + green + ', 0)',

    padding: '5px',
    "text-align": "center"
  };

  // rounding -- https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
  const percentage = +Math.abs(polarity*100).toFixed(2);
  const lexdiv2 = lexdiv.toFixed(2);
        
  var colorOfPolarity; // highlight color in a chart 
  if (polarityLabel == "neu") {
    colorOfPolarity = 'black';
  }
  else if (polarityLabel == "pos") {
    colorOfPolarity = 'green';
  } else {
    colorOfPolarity = 'red';
  }

  let pos_hint_content = "ADJ: adjective\tADP: adposition\t ADV: adverb\t\
  AUX: auxiliary\n\
  CCONJ: coordinating conjunction\n\
  DET: determiner\n\
  INTJ: interjection\n\
  NOUN: noun\n\
  NUM: numeral\n\
  PART: particle\n\
  PRON: pronoun\n\
  PROPN: proper noun\
  PUNCT: punctuation\
  SCONJ: subordinating conjunction\
  SYM: symbol\
  VERB: verb\
  X: other";

  
  
  return (
    <MuiThemeProvider>

                <div className="inputCard" >

                    <Paper className="content">
                        <h2>Интеллектуальный анализ текста</h2>

                        
                        <textarea ref={fieldRef} 
                        rows={4}
                        cols={27}>
                        </textarea> 
                        <div id="buttonBlock">
                          <Button onClick={analyze}>АНАЛИЗ</Button>
                        </div>
                                
                    </Paper>

                </div>


                <div >
                  <div className="container">
                    <Paper zdepth={3} className="paperItem">
                      <div className="cardName">Частота слов</div>
                      
                        <Plot
                          data={[
                            {
                              x: mostCommonWords,
                              y: freqs,
                              type: 'bar',
                              // mode: 'lines',
                              marker: {color: 'green'},

                            },
                          ]}
                          layout={ {width: 450, height: 350} }
                        />            

                    </Paper>
                    <Paper className="paperItem">
                      <div className="cardName">Анализ тональности</div>
                      
                      <div className="contentBlock">                            
                     
                       <CircularProgressbar 
                        className='pbar'
                        value={percentage} 
                        text={<tspan dy={6} dx={-28}>{`${percentage}%`}</tspan>}

                        styles ={buildStyles({

                            pathColor: colorOfPolarity, 
                            textColor: colorOfPolarity,
                        })}
                        /> 

                      </div>
                    </Paper>
                    <Paper zDepth={3} className="paperItem">
                      <div className="cardName">Синонимичность и антонимичность</div>
                      <div class="contentBlock">

                        <Plot
                          data={
                            [
                              {
                                x: listOfWords,
                                y: numOfSyns,
                                name: 'Кол-во синонимов',
                                type: 'bar'
                              },
                              {
                                x: listOfWords,
                                y: numOfAnts,
                                name: 'Кол-во антонимов',
                                type: 'bar'
                              }
                            ]
                          }
                          layout={ {width: 500, height: 350, barmode:"stack"} }
                        />

                      </div>
                    </Paper>
                    <Paper zDepth={3} className="paperItem">
                      <div className="cardName">Перевод</div>
                      <div className="contentBlock">
                        {writeMode ? translatedSentence : ''}
                      </div>
                    </Paper>
                    <Paper zDepth={3} className="paperItem">
                      <div className="cardName">Распознавание именованных сущностей</div>
                      <div id="ner">
                         
                      </div>
                    </Paper>
                    <Paper zDepth={3} className="paperItem">
                      <div className="cardName">Лексическое разнообразие</div>
                      <div className="contentBlock">
                      
                      <CircularProgressbar
                        className="pbar"
                        value={lexdiv2*100}
                        text={<tspan dy={5} dx={-22}>{`${lexdiv2*100}%`}</tspan>}
                        strokeWidth={50}
                        background
                        backgroundPadding={0}
                        styles={buildStyles({
                          textColor: "white",
                          backgroundColor: "#F17E3A",
                          pathColor: "#2877B4",
                          strokeLinecap: "butt"
                        })}
                      />

                      </div>
                    </Paper>
                    <Paper zDepth={3} className="paperItem">
                      <div className="cardName">Выделение частей речи </div>
                        <div id="pos" class="pos_hint" data-title={pos_hint_content} >
                          
                        </div>
                    </Paper>
                  </div>
                </div>

            </MuiThemeProvider>

  );

}

export default App;