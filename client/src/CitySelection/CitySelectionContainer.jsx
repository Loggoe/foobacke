import React from "react";
import axios from "axios";
import CityCard from "./CityCard.jsx";
import TwitterWordCloud from "../DataViz/TwitterWordCloud.jsx";

class CitySelectionContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCity: '',
      frequency_list: [],
      twitterFetchInProgress: false
    };
    this.stylePopulation = this.stylePopulation.bind(this);
    this.deleteOrSave = this.deleteOrSave.bind(this);
    this.showCityDetails = this.showCityDetails.bind(this);
    this.getTweets = this.getTweets.bind(this);
  }
  //adds clicked city to favorites in database
  save(city) {
    axios
      .post("/addFaves", {
        city: city
      })
      .catch(err => {
        console.log("ERR IN SAVE CITY CLIENT:", err);
      });
  }
  
  //removes clicked city from favorites in database
  delete(city) {
    axios
      .post("/deleteFaves", {
        city: city
      })
      .then(res => {
        axios.get("/faves").then(data => {
          this.props.setInfo("favorites", data.data);
        });
      })
      .catch(err => {
        console.log("ERR IN SAVE CITY CLIENT:", err);
      });
  }

  deleteOrSave(city) {
    this.props.showFavorites ? this.delete(city): this.save(city);
  }

  //converts population number into a string and formats it with commas for better readability/user experience
  stylePopulation(population) {
    var reversed = population
      .toString()
      .split("")
      .reverse();
    for (var i = 3; i < reversed.length; i += 3) {
      reversed.splice(i, 0, ",");
      i++;
    }
    return reversed.reverse().join("");
  }

  showCityDetails(cityName) {
    this.setState({
      selectedCity: cityName
    }, () => {
      this.getTweets(this.state.selectedCity);
    });
  }

  getTweets(cityName) {
    this.setState({twitterFetchInProgress: true});
    const params = {
      cityName: cityName //matches city_name_short from city props
    }
    // console.log('making a get to /twitter for', params.cityName)
    axios.get('/twitter', {params: params})
      .then(resp => {
        const frequency_list = resp.data.map(word => {
          word.value = word.size;
          return word
        });
        this.setState({
          frequency_list: frequency_list,
          twitterFetchInProgress: false
        });
      })
      .catch(err => console.log(err));
  }

  //renders each city from props.display or props.favorites
  //if favorites is clicked (and therefore props.showFavorites = true), display favorite cities
  //The degrees symbol for temperature data display is inserted using {"\xB0"} 
  render() {
    let display = this.props.cities;
    if (this.props.showFavorites) {
      display = this.props.favorites;
    }

    let twitterWC = (this.state.frequency_list.length ? <TwitterWordCloud
    words={this.state.frequency_list}
    /> : null);

    if (display.length > 0) {
      return (
        <div style={{height: '100vh'}}>
          {/* {this.state.frequency_list.length ? <TwitterWordCloud
                                      words={this.state.frequency_list}
                                      /> : null} */}
        <div className="cities">
          {display.map(city => {
            var popString = this.stylePopulation(city.population);
            return (
              <div id="temp" key={city._id}>
              <CityCard
                city={city}
                handleClick={this.deleteOrSave}
                showDetails={this.showCityDetails}
                twitterWC={twitterWC}
                twitterLoading={this.state.twitterFetchInProgress}
              />
            </div>
            );
          })}
        </div>
        </div>
      );
    } else if (display === this.props.favorites) {
      return <div>No favorites saved. Please select favorite cities</div>;
    } else {
      return (
        <div>No cities match your search. Please select fewer filters.</div>
      );
    }
  }
}

export default CitySelectionContainer;
