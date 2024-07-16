var softcap_data = {
	ts11_log_big_rip: {
		1: {
			func: "pow",
			start: 11e4,
			pow: 0.8,
			derv: true
		},
		2: {
			func: "pow",
			start: 13e4,
			pow: 0.7,
			derv: true
		},
		3: {
			func: "pow",
			start: 15e4,
			pow: 0.6,
			derv: true
		},
		4: {
			func: "pow",
			start: 17e4,
			pow: 0.5,
			derv: true
		},
		5: {
			func: "pow",
			start: 19e4,
			pow: 0.4,
			derv: true
		}
	},
	inf_time_log: {
		1: {
			func: "pow",
			start: 12e4,
			pow: 0.5,
			derv: false
		},
		2: {
			func: "pow",
			start() {
				let r = 1.2e7
				if (hasNB(4)) r *= NT.eff("boost", 4)[1]
				return r
			},
			pow: 2/3,
			derv: false
		}
	},
	inf_time_log_big_rip: {
		1: {
			func: "pow",
			start: 100,
			pow: 0.5,
			derv: false
		}
	},
	bam: {
		1: {
			func: "pow",
			start: E(1e80),
			pow: 0.8,
			derv: true
		}
	},
	
	ts_ngm4r: {
		name: "Effective Time Shards (NG-4R)",
		1: {
			func: "dilate",
			start: function(){return E(10)},
			base: 10,
			pow: function(){return dilationPowerStrength()}
		},
		2: {
			func: "dilate",
			start: function(){
				let ret=E(Number.MAX_VALUE);
				if (player.infinityUpgrades.includes("timeMult")) ret = ret.times(infUpg11Pow());
				if (player.infinityUpgrades.includes("timeMult2")) ret = ret.times(infUpg13Pow());
				return ret;
			},
			base: 10,
			pow: function(){return dilationPowerStrength()}
		}
	},
	ts1_ngm4r: {
		name: "Tickspeed (NG-4R)",
		1: {
			func: "dilate",
			start: function(){
				let ret=E(Number.MAX_VALUE);
				if (player.infinityUpgrades.includes("timeMult")) ret = ret.times(infUpg11Pow());
				if (player.infinityUpgrades.includes("timeMult2")) ret = ret.times(infUpg13Pow());
				return ret;
			},
			base: 10,
			pow: function(){return dilationPowerStrength()}
		}
	},
	td_ngm4r: {
		name: "Time Dimension Multipliers (NG-4R)",
		1: {
			func: "dilate",
			start: function(){
				let ret=E(Number.MAX_VALUE);
				if (player.infinityUpgrades.includes("timeMult")) ret = ret.times(infUpg11Pow());
				if (player.infinityUpgrades.includes("timeMult2")) ret = ret.times(infUpg13Pow());
				return ret;
			},
			base: 10,
			pow: function(){return dilationPowerStrength()}
		},
		2: {
			func: "dilate",
			start: function(){
				let ret=Decimal.pow(10,50000);
				if (player.infinityUpgrades.includes("timeMult")) ret = ret.times(infUpg11Pow());
				if (player.infinityUpgrades.includes("timeMult2")) ret = ret.times(infUpg13Pow());
				return ret;
			},
			base: 10,
			pow: function(){return dilationPowerStrength()}
		}
	},
	nd_ngm4r: {
		name: "Normal Dimension Multipliers (NG-4R)",
		1: {
			func: "dilate",
			start: function(){
				let ret=E(1e25);
				if (player.infinityUpgrades.includes("timeMult")) ret = ret.times(infUpg11Pow());
				if (player.infinityUpgrades.includes("timeMult2")) ret = ret.times(infUpg13Pow());
				return ret;
			},
			base: 10,
			pow: function(){return dilationPowerStrength()}
		},
		2: {
			func: "dilate",
			start: function(){
				let ret=E(1e35);
				if (player.infinityUpgrades.includes("timeMult")) ret = ret.times(infUpg11Pow());
				if (player.infinityUpgrades.includes("timeMult2")) ret = ret.times(infUpg13Pow());
				if (hasAch("r51")) ret = ret.times(1e15)
				return ret;
			},
			base: 10,
			pow: function(){return dilationPowerStrength()}
		},
		3: {
			func: "dilate",
			start: function(){
				let ret=E(Number.MAX_VALUE);
				if (player.infinityUpgrades.includes("timeMult")) ret = ret.times(infUpg11Pow());
				if (player.infinityUpgrades.includes("timeMult2")) ret = ret.times(infUpg13Pow());
				return ret;
			},
			base: 10,
			pow: function(){return dilationPowerStrength()}
		}
	},
}

var softcap_vars = {
	pow: ["start", "pow", "derv"],
	dilate: ["start", "base", "pow", "mul", "sub10"],
	log: ["pow", "mul", "add"],
	logshift: ["shift", "pow", "add"]
}

var softcap_funcs = {
	pow: function(x, start, pow, derv = false) {
		if (typeof start == "function") start = start()
		if (typeof pow == "function") pow = pow()
		if (typeof derv == "function") derv = derv()
		if (x > start) {
			x = Math.pow(x / start, pow)
			if (derv) x = (x - 1) / pow + 1
			x *= start
			return x
		} 
		return x
	},
	pow_decimal: function(x, start, pow, derv = false) {
		if (typeof start == "function") start = start()
		if (typeof pow == "function") pow = pow()
		if (typeof derv == "function") derv = derv()
		if (Decimal.gt(x, start)) {
			x = Decimal.div(x, start).pow(pow)
			if (derv) x = x.sub(1).div(pow).add(1)
			x = x.mul(start)
			return x
		}
		return x
	},
	log: function(x, pow = 1, mul = 1, add = 0) {
		if (typeof pow == "function") pow = pow()
		if (typeof mul == "function") mul = mul()
		if (typeof add == "function") add = add()
		var x2 = Math.pow(Math.log10(x) * mul + add, pow)
		return Math.min(x, x2)
	},
	logshift: function (x, shift, pow, add = 0){
		if (typeof pow == "function") pow = pow()
		if (typeof shift == "function") shift = shift()
		if (typeof add == "function") add = add()
		var x2 = Math.pow(Math.log10(x * shift), pow) + add
		return Math.min(x, x2)
	},
	dilate(x, start, base = 10, pow = 1, mul = 1, sub10 = 0) { 
		if (x <= start) return x

		var x_log = Math.log(x) / Math.log(base)
		var start_log = Math.log(start) / Math.log(base)

		var sub = sub10 / Math.log10(base)
		x_log -= sub
		start_log -= sub

		return Math.pow(base, (Math.pow(x_log / start_log, pow) * mul - mul + 1) * start_log + sub)
	},
	dilate_decimal(x, start, base = 10, pow = 1, mul = 1, sub10 = 0) { 
		if (x.lte(start)) return x

		var base_log = Decimal.log10(base)
		var x_log = x.log10() / base_log
		var start_log = start.log10() / base_log

		var sub = sub10 / base_log
		x_log -= sub
		start_log -= sub

		return Decimal.pow(base, (Math.pow(x_log / start_log, pow) * mul - mul + 1) * start_log + sub)
	},
}

function do_softcap(x, data, num) {
	var data = data[num]
	if (data === undefined) return
	var func = data.func
	if (func == "log" && data["start"]) if (x < data["start"]) return x
	var vars = softcap_vars[func]
	var y = data[vars[0]]
	if(typeof y === "function"){
		y = y();
	}
	if (x + 0 != x) func += "_decimal"
	return softcap_funcs[func](x, y, data[vars[1]], data[vars[2]])
}

function softcap(x, id, max = 1/0) {
	var data = softcap_data[id]
	if (bigRipped()) {
		var big_rip_data = softcap_data[id + "_big_rip"]
		if (big_rip_data !== undefined) data = big_rip_data
	}

	var sc = 1
	var stopped = false
	while (!stopped && sc <= max) {
		var y = do_softcap(x, data, sc)
		if (y !== undefined) {
			x = y
			sc++
		} else stopped = true
	}
	return x
}

/* Aarex is currently refactoring code... */
function doWeakerPowerReductionSoftcapNumber(num,start,exp){
	if (num < start || num < 1) return num
	return start*(( (num/start)**exp -1)/exp+1)
}

function doWeakerPowerReductionSoftcapDecimal(num,start,exp){
	if (num.lt(start) || num.lt(1)) return num
	return start.mul( num.div(start).pow(exp).minus(1).div(exp).add(1) )
}

function doStrongerPowerReductionSoftcapNumber(num,start,exp){
	if (num < start || num < 1) return num
	return start*((num/start)**exp)
}

function doStrongerPowerReductionSoftcapDecimal(num,start,exp){
	if (num.lt(start) || num.lt(1)) return num
	return start.mul(num.div(start).pow(exp))
}