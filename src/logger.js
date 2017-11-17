const EventEmitter = new (require('events'))();

var typesDefinitions = {};
var definedTypes = [];
var enabledTypes = [];

var enableTypesByEnv = function()
{

	definedTypes = Object.keys(typesDefinitions)

	if(typeof process.env.DEBUG != 'undefined')
	{
		let def

		process.env.DEBUG.split(',').forEach((v) => {
			let options = v.split(':')

			if(['log', '-log'].indexOf(options[0]) > -1)
			{
				let enable = options[0] === 'log'

				if(options[1] === '*')
				{
					definedTypes.forEach(v => {
						if(enable) this.enableType(v)
						else this.disableType(v)
					})
				}
				else
				{
					if(definedTypes.indexOf(options[1]) > -1)
					{
						if(enable) this.enableType(options[1])
						else this.disableType(options[1])
					}
				}
			}


		})

	}
}

class Logger 
{
    constructor({types = {} } = {})
    {
    	

      typesDefinitions = types
      enableTypesByEnv.call(this, definedTypes)
      
      return this
    }

    getTypes()
    {
    	return definedTypes
    }

    getEnabledTypes()
    {
    	return enabledTypes
    }

    // addType(type)
    // {
    // 	this.types.push(type)
    // 	return this
    // }

    hasType(type)
    {
    	return definedTypes.indexOf(type) > -1
    }

    isTypeEnabled(type)
    {
    	return this.hasType(type) && enabledTypes.indexOf(type) > -1
    }

    disableType(type)
    {
    	if(this.hasType(type))
    	{
    		let idx = enabledTypes.indexOf(type)
    		if(idx > -1) enabledTypes.splice(idx, 1)
    	}
    	return this
    }

    enableType(type)
    {
    	if(!this.isTypeEnabled(type))
    	{
    		enabledTypes.push(type)
    	}
    	return this
    }

    getLabelColor(type)
    {
    	return typeof typesDefinitions[type].labelColor != 'undefined' ? typesDefinitions[type].labelColor  : ''
    }

    on(event, func)
    {
        EventEmitter.on(event, func)
        return this
    }

    log(type, log)
    {

      if(this.isTypeEnabled(type))
      {

	      let date = new Date()
	      let args = ['%s %c[%s]%c ' + log, date.toUTCString(), this.getLabelColor(type), type.toUpperCase(), ''].concat(Object.values(arguments).slice(2))

	      if(EventEmitter.listenerCount('onLog') === 0)
	      {
	         this.on('onLog', function(logger, args, callback){
	          callback(args)
	        })
	      }

	      EventEmitter.emit('beforeLog', this, args)
	      EventEmitter.emit('onLog', this, args, this.logCallback)
	   }

	   return this
      
    }

    logCallback(args)
    {
        console.log.apply(this, args)
    }
}


module.exports = Logger
