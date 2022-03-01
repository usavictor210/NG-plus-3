function unstoreTT() {
	if (brSave.storedTS===undefined) return
	player.timestudy.theorem = brSave && brSave.storedTS.tt
	player.timestudy.amcost = pow10(2e4 * (brSave.storedTS.boughtA + 1))
	player.timestudy.ipcost = pow10(100 * brSave.storedTS.boughtI)
	player.timestudy.epcost = pow2(brSave.storedTS.boughtE)
	var newTS = []
	var newMS = []
	var studies=brSave.storedTS.studies
	for (var s = 0; s < studies.length; s++) {
		var num=studies[s]
		if (typeof(num)=="string") num=parseInt(num)
		if (num<240) newTS.push(num)
		else newMS.push("t"+num)
	}
	for (var s = 7; s < 15; s++) if (player.masterystudies.includes("d" + s)) newMS.push("d" + s)
	player.timestudy.studies = newTS
	player.masterystudies = newMS
	updateBoughtTimeStudies()
	performedTS = false
	updateTheoremButtons()
	drawStudyTree()
	maybeShowFillAll()
	drawMasteryTree()
	updateMasteryStudyButtons()
	delete brSave.storedTS
}

function getSpaceShardsGain() {
	let ret = brSave && brSave.active ? brSave.bestThisRun : player.money
	ret = E_pow(ret.add(1).log10() / 2000, 1.5).times(player.dilation.dilatedTime.add(1).pow(0.05))
	if (!brSave.active || tmp.be) {
		if (beSave && beSave.upgrades.includes(3)) ret = ret.times(getBreakUpgMult(3))
		if (beSave && beSave.upgrades.includes(6)) ret = ret.times(getBreakUpgMult(6))
	}
	if (hasNU(9)) ret = ret.times(Decimal.max(getEternitied(), 1).pow(0.1))

	let log = ret.log10()
	let log4log = Math.log10(log) / Math.log10(4)
	let start = 5 //Starts at e1,024.
	if (log4log > start && false) { //removed the softcap for now, it can go back in later maybe
		let capped=Math.min(Math.floor(Math.log10(Math.max(log4log + 2 - start, 1)) / Math.log10(2)), 10 - start)
		log4log = (log4log - Math.pow(2, capped) - start + 2) / Math.pow(2, capped) + capped + start - 1
		log = Math.pow(4, log4log)
	}
	ret = pow10(log)

	if (isNaN(ret.e)) return E(0)
	return ret.floor()
}

let bigRipUpgCosts = [0, 2, 3, 5, 20, 30, 45, 60, 150, 300, 2000, 1e9, 3e14, 1e17, 3e18, 3e20, 5e22, 1e32, 1e145, 1e150, Number.MAX_VALUE]
function buyBigRipUpg(id) {
	if (brSave.spaceShards.lt(bigRipUpgCosts[id]) || brSave.upgrades.includes(id)) return
	brSave.spaceShards = brSave && brSave.spaceShards.sub(bigRipUpgCosts[id])
	if (ghSave.milestones < 8) brSave.spaceShards=brSave.spaceShards.round()
	brSave.upgrades.push(id)
	document.getElementById("spaceShards").textContent = shortenDimensions(brSave.spaceShards)
	if (brSave.active) tweakBigRip(id, true)
	if (id == 10 && !brSave.upgrades.includes(9)) {
		brSave.upgrades.push(9)
		if (brSave.active) tweakBigRip(9, true)
	}
	for (var u = 1; u <= getMaxBigRipUpgrades(); u++) {
		document.getElementById("bigripupg" + u).className = brSave && brSave.upgrades.includes(u) ? "gluonupgradebought bigrip" + (isBigRipUpgradeActive(u, true) ? "" : "off") : brSave.spaceShards.lt(bigRipUpgCosts[u]) ? "gluonupgrade unavailablebtn" : "gluonupgrade bigrip"
	}
}

function tweakBigRip(id, reset) {
	if (id == 2) {
		for (var ec = 1; ec < 15; ec++) player.eternityChalls["eterc" + ec] = 5
		player.eternities = Math.max(player.eternities, 1e5)
		if (!reset) updateEternityChallenges()
	}
	if (!brSave.upgrades.includes(9)) {
		if (id == 3) player.timestudy.theorem += 5
		if (id == 5) player.timestudy.theorem += 20
		if (id == 7 && !player.timestudy.studies.includes(192)) player.timestudy.studies.push(192)
	}
	if (id == 9) {
		if (reset) player.timestudy = {
			theorem: 0,
			amcost: E("1e20000"),
			ipcost: E(1),
			epcost: E(1),
			studies: []
		}
		if (!brSave.upgrades.includes(12)) player.timestudy.theorem += 1350
	}
	if (id == 10) {
		if (!player.dilation.studies.includes(1)) player.dilation.studies.push(1)
		if (reset) {
			showTab("eternitystore")
			showEternityTab("dilation")
		}
	}
	if (id == 11) {
		if (reset) player.timestudy = {
			theorem: 0,
			amcost: E("1e20000"),
			ipcost: E(1),
			epcost: E(1),
			studies: []
		}
		if (!inQCModifier("ad")) {
			player.dilation.tachyonParticles = player.dilation.tachyonParticles.max(player.dilation.bestTP.sqrt())
			player.dilation.totalTachyonParticles = player.dilation.totalTachyonParticles.max(player.dilation.bestTP.sqrt())
		}
	}
}

function isBigRipUpgradeActive(id, bigRipped) {
	if (player.masterystudies == undefined) return false
	if (bigRipped === undefined ? !brSave.active : !bigRipped) return false
	if (id == 1) if (!brSave.upgrades.includes(17)) for (var u = 3; u < 18; u++) if (brSave.upgrades.includes(u)) return false
	if (id > 2 && id != 4 && id < 9) if (brSave.upgrades.includes(9) && (id != 8 || !hasNU(11))) return false
	if (id == 4) if (brSave.upgrades.includes(11)) return false
	return brSave.upgrades.includes(id)
}

function updateBreakEternity() {
	if (player.masterystudies === undefined) {
		document.getElementById("breakEternityTabbtn").style.display = "none"
		return
	}
	document.getElementById("breakEternityTabbtn").style.display = brSave && brSave.active || beSave.unlocked ? "" : "none"
	if (beSave && beSave.unlocked) {
		document.getElementById("breakEternityReq").style.display = "none"
		document.getElementById("breakEternityShop").style.display = ""
		document.getElementById("breakEternityNoBigRip").style.display = brSave && brSave.active ? "none" : ""
		document.getElementById("breakEternityBtn").textContent = (beSave.break ? "FIX" : "BREAK") + " ETERNITY"
		for (var u = 1; u < getBEUnls(); u++) document.getElementById("breakUpg" + u + "Cost").textContent = shortenDimensions(getBreakUpgCost(u))
		document.getElementById("breakUpg7MultIncrease").textContent = shortenDimensions(1e9)
		document.getElementById("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
		document.getElementById("breakUpgRS").style.display = brSave && brSave.active ? "" : "none"
		document.getElementById("breakUpgR4").style.display = ghSave.breakDilation.unl ? "" : "none"
	} else {
		document.getElementById("breakEternityReq").style.display = ""
		document.getElementById("breakEternityReq").textContent = "You need to get " + shorten(E("1e1200")) + " EP before you can Break Eternity."
		document.getElementById("breakEternityNoBigRip").style.display = "none"
		document.getElementById("breakEternityShop").style.display = "none"
	}
}

function getBEUnls() {
	let x = 8
	if (ghSave.ghostlyPhotons.unl) x += 3
	if (ghSave.breakDilation.unl) x += 1
	return x
}

function breakEternity() {
	beSave.break = !beSave.break
	beSave.did = true
	document.getElementById("breakEternityBtn").textContent = (beSave.break ? "FIX" : "BREAK") + " ETERNITY"
	if (brSave.active) {
		tmp.be = beSave.break
		updateTemp()
		if (!tmp.be && document.getElementById("timedimensions").style.display == "block") showDimTab("antimatterdimensions")
	}
	if (!player.dilation.active && isSmartPeakActivated) {
		EPminpeakType = 'normal'
		EPminpeak = E(0)
		player.peakSpent = 0
	}
}

function getEMGain() {
	let log = player.timeShards.div(1e9).log10() * 0.25
	if (log > 15) log = Math.sqrt(log * 15)
	
	let log2log = Math.log10(log) / Math.log10(2)
	let start = 10 //Starts at e1024.
	if (log2log > start) {
		if (hasBDUpg(3)) {
			let exp = 1.5
			log2log = (log2log*start**(exp-1))**(1/exp)
		} else {
			let capped = Math.min(Math.floor(Math.log10(Math.max(log2log + 2 - start, 1)) / Math.log10(2)), 20 - start)
			log2log = (log2log - Math.pow(2, capped) - start + 2) / Math.pow(2, capped) + capped + start - 1
		}
		log = Math.pow(2, log2log)
	}

	let x = pow10(log)
	if (player.achievements.includes("ng3p104")) x = x.pow(1.1)
	
	return x.floor()
}

var breakUpgCosts = [1, 1e3, 2e6, 2e11, 8e17, 1e45, null, 1e290, E("1e350"), E("1e375"), E("e1450")]
function getBreakUpgCost(id) {
	if (id == 7) return pow2(beSave.epMultPower).times(1e5)
	return breakUpgCosts[id - 1]
}

function buyBreakUpg(id) {
	if (!beSave.eternalMatter.gte(getBreakUpgCost(id)) || beSave.upgrades.includes(id)) return
	beSave.eternalMatter = beSave.eternalMatter.sub(getBreakUpgCost(id))
	if (ghSave.milestones < 15) beSave.eternalMatter = beSave.eternalMatter.round()
	if (id == 7) {
		beSave.epMultPower++
		document.getElementById("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
		document.getElementById("breakUpg7Cost").textContent = shortenDimensions(getBreakUpgCost(7))
	} else beSave.upgrades.push(id)
	document.getElementById("eternalMatter").textContent = shortenDimensions(beSave.eternalMatter)
}

function getBreakUpgMult(id) {
	return tmp.beu[id]
}

function maxBuyBEEPMult() {
	let cost = getBreakUpgCost(7)
	if (!beSave.eternalMatter.gte(cost)) return
	let toBuy = Math.floor(beSave.eternalMatter.div(cost).add(1).log(2))
	let toSpend = pow2(toBuy).sub(1).times(cost).min(beSave.eternalMatter)
	beSave.epMultPower += toBuy
	beSave.eternalMatter = beSave.eternalMatter.sub(toSpend)
	if (ghSave.milestones < 15) beSave.eternalMatter = beSave.eternalMatter.round()
	document.getElementById("eternalMatter").textContent = shortenDimensions(beSave.eternalMatter)
	document.getElementById("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
	document.getElementById("breakUpg7Cost").textContent = shortenDimensions(getBreakUpgCost(7))
}

function getMaxBigRipUpgrades() {
	if (ghSave.ghostlyPhotons.unl) return tmp.ngp3l ? 19 : 20
	return 17
}
