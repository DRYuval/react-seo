import React from 'react';

// urls = [{url,isFullMatch,ajaxFunction,urlParams(name or regex or none)},]

class ReactSEO{
	constructor(){
		RegExp.escape= (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
		Function.prototype.bindArgs =
		function (...boundArgs)
		{
			const that = this;
			return (...args) => that.call(this, ...boundArgs, ...args);
		};
		}
	startMagic(urls,renderFunction){ 
		for (let i=0;i<urls.length;i++){
			urls[i] = this.normalize(urls[i]);
			if (this.checkUrlMatch(urls[i].url,urls[i].isFullMatch)){
				urls[i].ajaxFunction = this.bindParams(urls[i].ajaxFunction,urls[i].urlParams,urls[i].url);
				new Promise((resolve)=>urls[i].ajaxFunction(resolve)).then(()=>{ 
					renderFunction();
				});
				this.entryPoint = urls[i].url;
				break;
			}
			else{
				if (i === urls.length-1)
					renderFunction();
			}
				
		}
	}
	
	normalize(url){
		if (url.isFullMatch !== false && url.isFullMatch !== true)
			url.isFullMatch = true;
		if (!Array.isArray(url.urlParams))
			url.urlParams = [];
		return url;
	}
	
	bindParams(funk,urlParams){
		const args = [];
		const url = window.location.href;
		let regx;
		for (let i=0;i<urlParams.length;i++){
			if (urlParams[i].constructor === RegExp)
				args.push(url.replace(urlParams[i],''))
			else{
				if (typeof urlParams[i] === 'string')
				{
					regx = new RegExp("(.+" + RegExp.escape(urlParams[i]) + "=|($|&|\/|\#).+)"); //escape function needs testing
					
					args.push(url.replace(regx,''))
				}
			
			}
			
		}
		
		return funk.bindArgs(...args);
	}
	
	
	getEntryPoint(){
		return this.entryPoint;
	}
	checkUrlMatch(url,isFullMatch){
		if (isFullMatch){
			if (url.replace(/(^(https?\:\/\/)?(www\.)?|\/$)/g,'') === window.location.href.replace(/(^(https?\:\/\/)?(www\.)?|\/$)/g,''))
				return true;
		}
		else{
			if (window.location.href.indexOf(url) !== -1)
				return true;
		}
		
		return false;
	}
}

const GAV = new ReactSEO();
export default GAV