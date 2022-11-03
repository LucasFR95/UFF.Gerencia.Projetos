class IA {
	constructor(p) {
		this.alertList = "";
		this.constructor.count++;

		p.name = "Inteligencia Artificial " + this.constructor.count;

		// Decide se compra ou não uma propriedade que a IA caiu
		// Retorno: boolean (verdadeiro para comprar).
		// Arguments:
		// index: o index da propriedade (0-39).
		this.buyProperty = function (index) {
			console.log("buyProperty");
			var s = quadro[index];

			if (p.money > s.price + 50) {
				return true;
			} else {
				return false;
			}

		};

		// Calcula a resposta para uma oferta de negócio
		// Retorno: boolean/instancia de Negocio: um objeto de Negocio válido para contra-oferta (com a IA como destinatário); falso para declinar; verdadeiro para aceitar.
		// Arguments:
		// NegocioObj: A oferta de negocio, uma instancia de Negocio, tendo a IA como beneficiária.
		this.acceptTrade = function (tradeObj) {
			console.log("acceptTrade");

			var tradeValue = 0;
			var money = tradeObj.getMoney();
			var initiator = tradeObj.getInitiator();
			var recipient = tradeObj.getRecipient();
			var property = [];

			tradeValue += 10 * tradeObj.getCommunityChestJailCard();
			tradeValue += 10 * tradeObj.getChanceJailCard();

			tradeValue += money;

			for (var i = 0; i < 40; i++) {
				property[i] = tradeObj.getProperty(i);
				tradeValue += tradeObj.getProperty(i) * quadro[i].price * (quadro[i].mortgage ? 0.5 : 1);
			}

			console.log(tradeValue);

			var proposedMoney = 25 - tradeValue + money;

			if (tradeValue > 25) {
				return true;
			} else if (tradeValue >= -50 && initiator.money > proposedMoney) {

				return new Trade(initiator, recipient, proposedMoney, property, tradeObj.getCommunityChestJailCard(), tradeObj.getChanceJailCard());
			}

			return false;
		};

		// Esta função é chamada no início do turno da IA, antes de qualquer dado ser lançado. O objetivo é permitir que a IA gerencie propriedades e/ou inicie negociações.
		// Retorno: boolean: Deve retornar true se e somente se a IA propôs uma negociação.
		this.beforeTurn = function () {
			console.log("beforeTurn");
			var s;
			var allGroupOwned;
			var max;
			var leastHouseProperty;
			var leastHouseNumber;

			// Comprar casas
			for (var i = 0; i < 40; i++) {
				s = quadro[i];

				if (s.owner === p.index && s.groupNumber >= 3) {
					max = s.group.length;
					allGroupOwned = true;
					leastHouseNumber = 6; // Nenhuma propriedade podera ter 6 casas.

					for (var j = max - 1; j >= 0; j--) {
						if (quadro[s.group[j]].owner !== p.index) {
							allGroupOwned = false;
							break;
						}

						if (quadro[s.group[j]].house < leastHouseNumber) {
							leastHouseProperty = quadro[s.group[j]];
							leastHouseNumber = leastHouseProperty.house;
						}
					}

					if (!allGroupOwned) {
						continue;
					}

					if (p.money > leastHouseProperty.houseprice + 100) {
						buyHouse(leastHouseProperty.index);
					}
				}
			}

			// Propriedade não hipotecada
			for (var i = 39; i >= 0; i--) {
				s = quadro[i];

				if (s.owner === p.index && s.mortgage && p.money > s.price) {
					unmortgage(i);
				}
			}

			return false;
		};

		var utilityForRailroadFlag = true; // Não oferece este comércio mais de uma vez.

		// Essa função é chamada toda vez que a IA pousa em um quadrado. O objetivo é permitir que a IA gerencie propriedades e/ou inicie negociações.
		// Returno: boolean: Deve retornar true se e somente se a IA propôs uma negociação.
		this.onLand = function () {
			console.log("onLand");
			var proposedTrade;
			var property = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			var railroadIndexes = [5, 15, 25, 35];
			var requestedRailroad;
			var offeredUtility;
			var s;

			// Se a IA possui exatamente uma utilidade, tenta trocár por uma ferrovia.
			for (var i = 0; i < 4; i++) {
				s = quadro[railroadIndexes[i]];

				if (s.owner !== 0 && s.owner !== p.index) {
					requestedRailroad = s.index;
					break;
				}
			}

			if (quadro[12].owner === p.index && quadro[28].owner !== p.index) {
				offeredUtility = 12;
			} else if (quadro[28].owner === p.index && quadro[12].owner !== p.index) {
				offeredUtility = 28;
			}

			if (utilityForRailroadFlag && game.getDie(1) !== game.getDie(2) && requestedRailroad && offeredUtility) {
				utilityForRailroadFlag = false;
				property[requestedRailroad] = -1;
				property[offeredUtility] = 1;

				proposedTrade = new Trade(p, player[quadro[requestedRailroad].owner], 0, property, 0, 0);

				game.trade(proposedTrade);
				return true;
			}

			return false;
		};

		// Determine se deve pagar fiança/usar o cartão livre de prisão (se estiver em posse).		
		this.postBail = function () {
			console.log("postBail");

			// p.jailroll === 2 na terceira vez na cadeia
			if ((p.communityChestJailCard || p.chanceJailCard) && p.jailroll === 2) {
				return true;
			} else {
				return false;
			}
		};

		// Hipoteca uma quantidade de propriedades para pagar os débitos
		// Returno: void: não tem retorno, só chama as funções hipotecar()/venderCasa()
		this.pagarDebito = function () {
			console.log("pagar debito");
			for (var i = 39; i >= 0; i--) {
				s = quadro[i];

				if (s.owner === p.index && !s.mortgage && s.house === 0) {
					mortgage(i);
					console.log(s.name);
				}

				if (p.money >= 0) {
					return;
				}
			}

		};

		// Determine o que oferecer durante um oferta.
		// Returno: inteiro: -1 para oferta de saída, 0 para aprovação, um valor positivo para o lance.
		this.bid = function (propriedade, ofertaAtual) {
			console.log("oferta");
			var oferta;

			oferta = ofertaAtual + Math.round(Math.random() * 20 + 10);

			if (p.money < oferta + 50 || oferta > quadro[propriedade].price * 1.5) {
				return -1;
			} else {
				return oferta;
			}
		};
	}
}