import React, {Component} from 'react';
import PropTypes from 'prop-types';
import '../App.css';
import { CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// import { CircularProgressWithLabel } from '@material-ui/core';
import CircularProgressWithLabel from '@material-ui/core/CircularProgress';


// Polarity Component
class Polarity extends Component {

    get_polarity(){
        const url_sa = '/analyse/sentiment/'
        fetch(url_sa.concat(fieldRef.current.value))
        .then(res => res.json())
        .then(data => data);

        return data["score"];
    }

    render() {
        const polarity = get_polarity();

        const green = Math.round((polarity + 1) * 128);
        const red = 255 - green;
        const textColor = {
            backgroundColor: 'rgb(' + red + ', ' + green + ', 0)',
            padding: '5px',
            'text-align': "center"

        };
        // rounding -- https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
        const percentage = +Math.abs(polarity*100).toFixed(2);
        
        var colorOfPolarity; // highlight color in a chart 
        if (this.props.polarity == 0) {
            colorOfPolarity = 'black';
        }
        else if (this.props.polarity > 0) {
            colorOfPolarity = 'green';
        } else {
            colorOfPolarity = 'red';
        }

        // return <div style={textColor}>{this.props.polarity}</div>;
        return (
            <CircularProgressbar 
                className='pbar'
                value={percentage} 
                text={`${percentage}%`} 

                styles ={buildStyles({
                    pathColor: colorOfPolarity, 
                    textColor: colorOfPolarity,
                })}
                />
            
            
            )


    }
}

export default Polarity;