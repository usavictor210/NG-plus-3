//Real
const BOSONIC_LAB = LAB = {
	/* CORE */
	//Unlock
	req: _ => tmp.funda.photon?.unls >= 8,
	unlocked: _ => blSave?.unl,
	unlock() {
		blSave.unl = true
		notifyFeature("bl")
	},

	//Calculation
	setup() {
		return {
			bosons: E(0),
			best_bosons: E(0),
			hypo_field: {}
		}
	},
	calc(dt) {
		blSave.bosons = blSave.bosons.add(this.prod().mul(dt))
		blSave.best_bosons = blSave.best_bosons.max(blSave.bosons)
	},
	temp() {
		if (!this.unlocked()) return
		let data = tmp.funda.lab || {}
		tmp.funda.lab = data

		if (data.lim == undefined) BL_HYPOTHESES.recalc()
		BL_HYPOTHESES.temp()
	},

	/* BOSONS */
	// Goal: 10M Bosons (100/s Boson production + x10 from Milestones)
	prod() {
		let r = E(0)
		if (hasBLMilestone(12)) r = r.mul(blEff(12))
		if (hasBLMilestone(19)) r = r.mul(blEff(19))
		if (HIGGS.unlocked()) r = r.mul(hbEff(0))
		return r
	},

	/* HTML */
	updateTab() {
		el("wz_req").style.display = !LAB.unlocked() ? "" : "none"
		el("wz_div").style.display = LAB.unlocked() ? "" : "none"
		if (!LAB.unlocked()) return

		el("bl_amt").textContent = shorten(blSave.bosons)
		el("bl_prod").textContent = shorten(this.prod()) + "/s"
		BL_HYPOTHESES.update()
	}
}

function hasBLMilestone(i) {
	/*if (!LAB.unlocked()) return
	return blSave.best_bosons.gte(LAB.milestones[i].req)*/

	return false
}

function blEff(i, def) {
	return /*tmp.funda.lab?.ms[i] ||*/ def
}

//Subfeatures
const BL_HYPOTHESES = {
	/* CALCULATION */
	temp() {
		tmp.funda.lab.eff = {}
		for (let i in tmp.funda.lab.mil) {
			tmp.funda.lab.eff[i] = []
			for (let j = 0; j < tmp.funda.lab.mil[i]; j++) {
				tmp.funda.lab.eff[i][j] = this.milestones[i][j].eff()
			}
		}
	},
	recalc() {
		tmp.funda.lab.lim = []
		tmp.funda.lab.str = []
		tmp.funda.lab.amt = []
		for (let [i, j] of Object.entries(this.data)) {
			tmp.funda.lab.lim[i] = j.lim ? j.lim() : 1/0
			tmp.funda.lab.str[i] = 0
			tmp.funda.lab.amt[i] = 0
		}

		for (let [i, j] of Object.entries(blSave.hypo_field)) {
			if (j < 2) {
				let add = j ? -1 : 1
				let [x, y] = [parseInt(i.split(";")[0]), parseInt(i.split(";")[1])]
				this.addStr(x-1, y, add)
				this.addStr(x+1, y, add)
				this.addStr(x, y-1, add)
				this.addStr(x, y+1, add)
			}
			tmp.funda.lab.amt[j]++
		}

		tmp.funda.lab.ch = { pos: 0, neg: 0 }
		for (let [i, j] of Object.entries(this.data)) {
			if (tmp.funda.lab.str[i] > 0) tmp.funda.lab.ch.pos += tmp.funda.lab.amt[i] * tmp.funda.lab.str[i] * j.mult
			if (tmp.funda.lab.str[i] < 0) tmp.funda.lab.ch.neg -= tmp.funda.lab.amt[i] * tmp.funda.lab.str[i] * j.mult
		}

		tmp.funda.lab.mil = {}
		for (let i in this.milestones) {
			tmp.funda.lab.mil[i] = 0
			for (let j of this.milestones[i]) {
				if (tmp.funda.lab.ch[i] < j.req) break
				tmp.funda.lab.mil[i]++
			}
		}
	},
	addStr(x, y, add) {
		let j = blSave.hypo_field[x+";"+y]
		if (j > 1) tmp.funda.lab.str[j] += add
	},

	/* HYPOTHESES */
	data: [
		{
			name: "W+ Generator",
			sym: "+",
			unl: _ => true,
			lim: _ => 1,
		}, {
			name: "W- Generator",
			sym: "-",
			unl: _ => true,
			lim: _ => 1,
		}, {
			name: "Infinity",
			sym: "∞",
			mult: .25,
			unl: _ => true,
			lim: _ => 5,
		}, {
			name: "Eternal",
			sym: "Δ",
			mult: 1,
			unl: _ => true,
			lim: _ => 3,
		}, {
			name: "Quantum",
			sym: "Π",
			unl: _ => false,
		}, {
			name: "Spectral",
			sym: "φ",
			unl: _ => false,
		}, {
			name: "Fundament",
			sym: "?",
			unl: _ => false,
		}
	],
	milestones: {
		pos: [
			{ req: 1, eff: _ => 1, desc: _ => "Testing..." }
		],
		neg: [
			{ req: 1, eff: _ => 1, desc: _ => "Testing..." }
		]
	},

	/* FIELD */
	clear() {
		blSave.hypo_field = {}
		BL_HYPOTHESES.recalc()
	},
	export: _ => exportData(PRESET_DATA.bl.get()),
	import: _ => PRESET_DATA.bl.load(prompt("Insert your preset here. Your field will be overwritten on import!")),
	choose(x) {
		BL_HYPOTHESES.hypo_chosen = x
	},
	place(x) {
		let i = BL_HYPOTHESES.hypo_chosen
		if (blSave.hypo_field[x] === i) delete blSave.hypo_field[x]
		else if (tmp.funda.lab.lim[i] > tmp.funda.lab.amt[i]) blSave.hypo_field[x] = i
		BL_HYPOTHESES.recalc()
	},

	/* HTML */
	setupTab() {
		let choices = ""
		for (let [i, h] of Object.entries(this.data)) choices += `<button class='hypo_btn' id='hypo_choice_${i}'  onclick="BL_HYPOTHESES.choose(${i})"><span class="hypo hypo${i}">${h.sym}</span></button>`
		el("hypo_choice").innerHTML = choices

		let field = "<tr>"
		for (let x = 0; x < 7; x++) {
			for (let y = 0; y < 7; y++) {
				field += `<td><button class='hypo_btn' onclick='BL_HYPOTHESES.place("${y};${x}")'><span class="hypo" id="hypo_${y};${x}"></span></button></td>`
			}
			field += "</tr><tr>"
		}
		el("hypo_field").innerHTML = field
	},
	update() {
		for (let [i, j] of Object.entries(this.data)) {
			let msg = `${getFullExpansion(tmp.funda.lab.amt[i])} / ${getFullExpansion(tmp.funda.lab.lim[i])} placed`
			if (i >= 2) msg += `, per charger: ${Math.abs(j.mult * tmp.funda.lab.str[i]).toFixed(2)} ${tmp.funda.lab.str[i] < 0 ? "Negative" : "Positive"} Hypercharge (${tmp.funda.lab.str[i].toFixed(2)}x)`
			msg = `${j.name} (${msg})`

			el("hypo_choice_" + i).className = "hypo_btn " + (this.hypo_chosen == i ? "chosen" : "")
			el("hypo_choice_" + i).style.display = j.unl() ? "" : "none"
			el("hypo_choice_" + i).setAttribute("ach-tooltip", msg)
		}

		el("wz_pos").textContent = shorten(tmp.funda.lab.ch.pos)
		el("wz_neg").textContent = shorten(tmp.funda.lab.ch.neg)

		for (let x = 0; x < 7; x++) {
			for (let y = 0; y < 7; y++) {
				let id = y+";"+x
				let type = blSave.hypo_field[id]
				el('hypo_'+id).className = type !== undefined ? "hypo hypo" + type : "hypo"
				el('hypo_'+id).textContent = type !== undefined ? this.data[type].sym : ""
			}
		}

		let msg = ""
		for (let i in tmp.funda.lab.eff) {
			for (let [i2, j] of Object.entries(tmp.funda.lab.eff[i])) msg += shorten(this.milestones[i][i2].req) + (i == "pos" ? " Positive" : " Negative") + " Hypercharge: " + this.milestones[i][i2].desc(j) + "<br>"
		}
		el("wz_eff").innerHTML = msg
	},
}

PRESET_DATA.bl = {
	name: "W & Z Field",
	in: _ => isTabShown("wz"),
	unl: _ => LAB.unlocked(),

	get() {
		let str = ""
		for (var [i, d] of Object.entries(blSave.hypo_field)) str+=","+i+";"+d
		return "[FIELD" + str + "]"
	},

	options: [],
	load(str, options) {
		if (str.slice(0,6) == "[FIELD" && str[str.length - 1] == "]") {
			let list = str.slice(6, str.length - 1).split(",").slice(1)
			let newField = {}, amts = [0,0,0,0,0,0,0,0,0,0]

			while (list.length) {
				let entry = list.pop().split(";")
				let check = entry.length == 3
				if (!check) {
					$.notify("[X] Invalid: Unknown cause")
					continue
				}

				check = (entry[0] >= 0 && entry[0] < 7) &&
					(entry[1] >= 0 && entry[1] < 7)
				if (!check) {
					$.notify("[X] Invalid: Wrong position")
					continue
				}

				let unl = BL_HYPOTHESES.data[entry[2]]?.unl
				check = unl && unl()

				if (!check) {
					$.notify("[X] Invalid: Kind might be invalid or locked!")
					continue
				}

				check = tmp.funda.lab.lim[entry[2]] >= amts[entry[2]]
				if (!check) {
					$.notify("[X] Invalid: Overflow")
					continue
				}

				newField[entry[0]+";"+entry[1]] = entry[2]
				amts[entry[2]]++
			}
			blSave.hypo_field = newField
			BL_HYPOTHESES.temp()
		} else {
			$.notify("[X] Invalid preset type!")
		}
	}
}