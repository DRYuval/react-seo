
<h2>Introduction</h2>

If you've ever worked on a React.js web application, and then tried to do SEO for the website and submit some of your pages to Fetch as Google,
you might have discovered that instead of seeing your page content, Google only sees a blank page:

![img](http://i.imgur.com/UEPKe6P.png)


If you've tried a find a solution for that problem, you probably seen online that you'll going to need to switch to server side rendering,
which can be pretty time consuming and complex to convert your client side rendered app to server side rendering (not to mention having
to install NodeJS on your server).

The thing about Google's crawlers is that although they do execute Javascript,
they will not wait for an AJAX call to return <strong>if the AJAX call was made after the page render</strong>.<br />
What I discovered however, is that the crawlers will wait for an AJAX call to be returned <strong>if the call was made before the page render</strong>.

react-seo allows you to do exactly that via a configurable API.

And the result? :

![img](http://i.imgur.com/xuIdKME.png)

<h2>Installation</h2>

    npm install --save react-seo


<h2>Usage</h2>

Import the package in your index.js file

    import ReactSEO from 'react-seo';

Then call

    ReactSEO.startMagic(urls,renderDOMFunction)


Urls is a list of objects, that each object represents a url to enable Google indexing on.
Each object sould have those properties:
<ul>
<li><strong>url</strong> - a string that represents the url to enable the indexing on.</li>
<li><strong>ajaxFunction</strong> - the page ajax function that will be called on initial app render 
(here you might pass an action if you're implementing the Flux data flow)</li>
<li><strong>isFullMatch</strong> (optional, default = true) - a boolean that states whether or not the url string should is a part of
a page url(comparison using str.indexOf) or is the exact url(comparison using str === str)</li>
<li><strong>urlParams</strong> (optional, default = []) - a list of url paramaters that should be passed to the ajax function.
The list can consist of strings if the url paramaters are in the format of 'example.com/page?param1=X&param2=Y'
or a custom regex that will be used to get the paramater from the url (using url.replace(regex,'')).
<br /><strong>Important</strong> - the url paramaters should be passed at the order that they should be passed to the ajax function!</li>
</ul>



renderDOMFunction is a function the will call your ReactDOM.render function.

Other functions:
<ul>
<li><strong>ReactSEO.getEntryPoint</strong> - returns the url requested on the initial application load.
(i.e. - the url entered in the browser to enter the site).<br /> 
</li>

</ul>


<h2>Important Warnings</h2>
<ul>
<li>You should not call ReactDOM.render explicitly, you only need to pass that renderDOMFunction to ReactSEO.startMagic.</li>
<li>react-seo uses promises to render the page after the ajax call returns,
therefore you HAVE to add a 'resolve' paramater as the last paramater of your ajaxFunction, and call it at the end of
the ajax function (after a response was returned). Don't forget to check if the resolve paramater was passed,
because you're probably not passing a resolve paramater when calling the ajax function explictly by yourself (example is available at the example section).</li>
</ul>


<h2>Example</h2>

index.js:

    import React from 'react';
    import Page1 from '../components/Page1.js';
    import Page2 from '../components/Page2.js';
    import ReactDOM from 'react-dom';
    import ReactSEO from 'react-seo';
    
    
    ReactSEO.startMagic([{url:'/products/',isFullMatch:false,
	      ajaxFunction:fetchGameData,urlParams:[/(.+\/products\/|\/[^\/]+)/g]}],renderDOM);
    
    
    function renderDOM(){
        ReactDOM.render(
          <BrowserRouter basename='/' >
            <div>
              <Route path = '/' component={Page1} />
              <Route path='/products/:id' component={Page2} />
              </div>
          </BrowserRouter>
          ,app);
          }


Page2.js:

    import React from 'react'; 
    import axios from 'axios';
    import CustomLoader from './CustomLoader';
    import AppBar from './AppBar';
    import GameDataStore from './GameDataStore';
    import { fetchGameData } from './actions';
    import Footer from './Footer';
    
    
    export default class Page2 extends React.Component{
        constructor(){
          super();
          this.state={loading:true,GameData: GameDataStore.getGameData()};
          }
        
        componentWillMount(){
              GameDataStore.on('gameDataIsInDaHouse',this.setData);
              
              // Checks if data was already fetched
              if (this.props.match.params && this.state.GameData.id !== this.props.match.params.id) // is data missing?
                  {
                   fetchGameData(this.props.match.params.id);
                  }
                else{ // data was already fetched, no need to fetch again.
                    this.setState({loading:false})
                    }
          }
          
          componentWillUnmount(){
              GameDataStore.removeListener('gameDataIsInDaHouse',this.setData);
            }
          
          setData(){
              const GameData = GameDataStore.getGameData();
              this.setState({GameData,loading:false});
          }
          
          render(){
              const data = (<div>
                               <h2>{this.state.GameData.title}</h2>
                               <h5>{this.state.GameData.price}</h5>
                           </div>);
              return (
                  <div>
                      <AppBar />
                           {this.state.loading ? <CustomLoader /> : data}
                      <Footer />
                  </div>
                  );
          }


ajaxFunction's ajax request:

    axios.get(`/gamedataapi?id=${id}`)
		.then((response)=>{
			// do stuff
			this.emit('gameDataIsInDaHouse');
			if (resolve) // IMPORTANT! call resolve only if it was passed.
				resolve();
			});


