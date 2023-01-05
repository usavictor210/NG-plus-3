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

function updateBigRipTab() {
	var max = getMaxBigRipUpgrades()
	el("spaceShards").textContent = shortenDimensions(brSave.spaceShards)
	for (var u = 18; u <= 20; u++) el("bigripupg" + u).parentElement.style.display = u > max ? "none" : ""
	for (var u = 1; u <= max; u++) {
		el("bigripupg" + u).className = brSave && hasRipUpg(u) ? "gluonupgradebought bigrip" + (isBigRipUpgradeActive(u, true) ? "" : "off") : brSave.spaceShards.lt(bigRipUpgCosts[u]) ? "gluonupgrade unavailablebtn" : "gluonupgrade bigrip"
		el("bigripupg" + u + "cost").textContent = shortenDimensions(E(bigRipUpgCosts[u]))
	}
	bigRipUpgradeUpdating()
}

function bigRipUpgradeUpdating(){
	if (ghSave.milestones>7) {
		el("spaceShards").textContent=shortenDimensions(brSave.spaceShards)
		for (var u=1;u<=getMaxBigRipUpgrades();u++) {
			el("bigripupg"+u).className = brSave && hasRipUpg(u) ? "gluonupgradebought bigrip" + (isBigRipUpgradeActive(u, true) ? "" : "off") : brSave.spaceShards.lt(bigRipUpgCosts[u]) ? "gluonupgrade unavailablebtn" : "gluonupgrade bigrip"
			el("bigripupg"+u+"cost").textContent = shortenDimensions(E(bigRipUpgCosts[u]))
		}
	}
	el("bigripupg1current").textContent=shortenDimensions(tmp.bru[1])
	el("bigripupg8current").textContent=shortenDimensions(tmp.bru[8])+(Decimal.gte(tmp.bru[8],Number.MAX_VALUE)&&!hasNU(11)?"x (cap)":"x")
	el("bigripupg14current").textContent=tmp.bru[14].toFixed(2)
	var bru15effect = tmp.bru[15]
	el("bigripupg15current").textContent=bru15effect < 999.995 ? bru15effect.toFixed(2) : getFullExpansion(Math.round(bru15effect))
	el("bigripupg16current").textContent=shorten(tmp.bru[16])
	el("bigripupg17current").textContent=tmp.bru[17]
	if (ghSave.ghostlyPhotons.unl) {
		el("bigripupg18current").textContent=shorten(tmp.bru[18])
		el("bigripupg19current").textContent=shorten(tmp.bru[19])
	}
}

let bigRipUpgCosts = [0, 2, 3, 5, 20, 30, 45, 60, 150, 300, 2000, 1e9, 3e14, 1e17, 3e18, 3e20, 5e22, 1e32, 1e145, 1e150, 1e90]
function buyBigRipUpg(id) {
	if (brSave.spaceShards.lt(bigRipUpgCosts[id]) || hasRipUpg(id)) return
	brSave.spaceShards = brSave && brSave.spaceShards.sub(bigRipUpgCosts[id])
	if (ghSave.milestones < 8) brSave.spaceShards=brSave.spaceShards.round()
	brSave.upgrades.push(id)
	el("spaceShards").textContent = shortenDimensions(brSave.spaceShards)
	if (brSave.active) tweakBigRip(id, true)
	if (id == 10 && !hasRipUpg(9)) {
		brSave.upgrades.push(9)
		if (brSave.active) tweakBigRip(9, true)
	}
	for (var u = 1; u <= getMaxBigRipUpgrades(); u++) {
		el("bigripupg" + u).className = brSave && hasRipUpg(u) ? "gluonupgradebought bigrip" + (isBigRipUpgradeActive(u, true) ? "" : "off") : brSave.spaceShards.lt(bigRipUpgCosts[u]) ? "gluonupgrade unavailablebtn" : "gluonupgrade bigrip"
	}
}

function tweakBigRip(id, reset) {
	if (id == 2) {
		for (var ec = 1; ec < 15; ec++) player.eternityChalls["eterc" + ec] = 5
		player.eternities = Math.max(player.eternities, 1e5)
		if (!reset) updateEternityChallenges()
	}
	if (!hasRipUpg(9)) {
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
		if (!hasRipUpg(12)) player.timestudy.theorem += 1350
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
		player.dilation.tachyonParticles = player.dilation.tachyonParticles.max(player.dilation.bestTP.sqrt())
		player.dilation.totalTachyonParticles = player.dilation.totalTachyonParticles.max(player.dilation.bestTP.sqrt())
	}
}

function hasRipUpg(x) {
	return brSave.upgrades.includes(x)
}

function getMaxBigRipUpgrades() {
	if (ghSave.ghostlyPhotons.unl) return 20
	return 17
}

function isBigRipUpgradeActive(id, bigRipped) {
	if (player.masterystudies == undefined) return false
	if (bigRipped === undefined ? !brSave.active : !bigRipped) return false
	if (id == 1) if (!hasRipUpg(17)) for (var u = 3; u < 18; u++) if (hasRipUpg(u)) return false
	if (id > 2 && id != 4 && id < 9) if (hasRipUpg(9) && (id != 8 || !hasNU(11))) return false
	if (id == 4) if (hasRipUpg(11)) return false
	return hasRipUpg(id)
}

//BREAK ETERNITY
function updateBreakEternity() {
	if (!tmp.ngp3) return

	let unl = beSave && beSave.unlocked
	el("betabbtn").style.display = unl ? "" : "none"
	el("breakEternityReq").style.display = unl ? "none" : ""
	el("breakEternityShop").style.display = unl ? "" : "none"

	if (unl) {
		el("breakEternityNoBigRip").style.display = brSave && brSave.active ? "none" : ""
		el("breakEternityBtn").style.display = brSave && brSave.active ? "" : "none"
		el("breakEternityBtn").textContent = (beSave.break ? "FIX" : "BREAK") + " ETERNITY"
		for (var u = 1; u < getBEUnls(); u++) el("breakUpg" + u + "Cost").textContent = shortenDimensions(getBreakUpgCost(u))
		el("breakUpg7MultIncrease").textContent = shortenDimensions(1e9)
		el("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
		el("breakUpgRS").style.display = brSave && brSave.active ? "" : "none"
		el("breakUpgR4").style.display = ghSave.breakDilation.unl ? "" : "none"
	} else {
		el("breakEternityReq").textContent = "You need to get " + shorten(E("1e1200")) + " EP before you can Break Eternity."
		el("breakEternityNoBigRip").style.display = "none"
	}
}


function breakEternityDisplay(){
	el("eternalMatter").textContent = shortenDimensions(beSave.eternalMatter)
	for (var u = 1; u < getBEUnls(); u++) {
		el("breakUpg" + u).className = (beSave.upgrades.includes(u) && u != 7) ? "eternityupbtnbought" : beSave.eternalMatter.gte(getBreakUpgCost(u)) ? "eternityupbtn" : "eternityupbtnlocked"
		if (u == 8) el("breakUpg8Mult").textContent = (getBreakUpgMult(8) * 100 - 100).toFixed(1)
		else if (u != 7 && el("breakUpg" + u + "Mult")) el("breakUpg" + u + "Mult").textContent = shortenMoney(getBreakUpgMult(u))
	}
	if (brSave.active) {
		el("eterShortcutEM").textContent=shortenDimensions(beSave.eternalMatter)
		el("eterShortcutEP").textContent=shortenDimensions(player.eternityPoints)
		el("eterShortcutTP").textContent=shortenMoney(player.dilation.tachyonParticles)
	}
	updateBDInBE()
}

function doBreakEternityUnlockStuff(){
	beSave.unlocked = true
	$.notify("Congratulations! You have unlocked Break Eternity!", "success")
	updateBreakEternity()
}

function breakEternity() {
	beSave.break = !beSave.break
	beSave.did = true
	el("breakEternityBtn").textContent = (beSave.break ? "FIX" : "BREAK") + " ETERNITY"
	if (brSave.active) {
		tmp.be = beSave.break
		updateTemp()
		if (!tmp.be && el("timedimensions").style.display == "block") showDimTab("antimatterdimensions")
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
	if (hasAch("ng3p104")) x = x.pow(1.1)
	
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
		el("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
		el("breakUpg7Cost").textContent = shortenDimensions(getBreakUpgCost(7))
	} else beSave.upgrades.push(id)
	el("eternalMatter").textContent = shortenDimensions(beSave.eternalMatter)
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
	el("eternalMatter").textContent = shortenDimensions(beSave.eternalMatter)
	el("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
	el("breakUpg7Cost").textContent = shortenDimensions(getBreakUpgCost(7))
}

function getBEUnls() {
	//Upgrades
	let x = 8
	if (ghSave.ghostlyPhotons.unl) x += 3
	if (ghSave.breakDilation.unl) x += 1
	return x
}