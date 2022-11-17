function Game() {
	var die1;
	var die2;
	var areDiceRolled = false;

	var auctionQueue = [];
	var highestbidder;
	var highestbid;
	var currentbidder = 1;
	var auctionproperty;

	this.rollDice = function() {
		die1 = Math.floor(Math.random() * 6) + 1;
		die2 = Math.floor(Math.random() * 6) + 1;
		areDiceRolled = true;
	};

	this.resetDice = function() {
		areDiceRolled = false;
	};

	this.next = function() {
		debugger
		if (!p.human && p.money < 0) {
			p.AI.pagarDebito();

			if (p.money < 0) {
				popup("<p>" + p.name + " está falido. Todos os seus bens serão entregues a " + player[p.creditor].name + ".</p>", game.bankruptcy);
			} else {
				roll();
			}
		} else if (areDiceRolled && doublecount === 0) {
			play();
		} else {
			roll();
		}
	};

	this.getDie = function(die) {
		if (die === 1) {

			return die1;
		} else {

			return die2;
		}

	};



	// funções de leilão

	var finalizeAuction = function() {
		var p = player[highestbidder];
		var sq = quadro[auctionproperty];

		if (highestbid > 0) {
			p.pay(highestbid, 0);
			sq.owner = highestbidder;
			addAlert(p.name + " comprou " + sq.name + " por $" + highestbid + ".");
		}

		for (var i = 1; i <= pcount; i++) {
			player[i].bidding = true;
		}

		$("#popupbackground").hide();
		$("#popupwrap").hide();

		if (!game.auction()) {
			play();
		}
	};

	this.addPropertyToAuctionQueue = function(propertyIndex) {
		auctionQueue.push(propertyIndex);
	};

	this.auction = function() {
		if (auctionQueue.length === 0) {
			return false;
		}

		index = auctionQueue.shift();

		var s = quadro[index];

		if (s.price === 0 || s.owner !== 0) {
			return game.auction();
		}

		auctionproperty = index;
		highestbidder = 0;
		highestbid = 0;
		currentbidder = turn + 1;

		if (currentbidder > pcount) {
			currentbidder -= pcount;
		}

		popup("<div style='font-weight: bold; font-size: 16px; margin-bottom: 10px;'>Leilão <span id='propertyname'></span></div><div>Oferta mais alta R$<span id='highestbid'></span> (<span id='highestbidder'></span>)</div><div><span id='currentbidder'></span>, é a sua vez de ofertar.</div<div><div class='d-flex align-items-center justify-content-center'><input class='form-control mt-2 mb-2' id='bid' title='Entre com uma quantia para ofertar por " + s.name + ".' style='width: 291px;' /></div></div><div><input type='button' value='Oferta' onclick='game.auctionBid();' title='Informe sua oferta.' class='btn btn-primary btn-sm mr-1' /><input type='button' value='Passar' title='Desiste de ofertar dessa vez.' onclick='game.auctionPass();' class='btn btn-primary btn-sm mr-1' /><input type='button' value='Sair do Leião' title='Para de  ofertar por " + s.name + " altogether.' onclick='if (confirm(\"Tem certeza de que deseja parar de licitar esta propriedade?\")) game.auctionExit();' class='btn btn-primary btn-sm' /></div>", "blank");

		document.getElementById("propertyname").innerHTML = "<a href='javascript:void(0);' onmouseover='showdeed(" + auctionproperty + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a>";
		document.getElementById("highestbid").innerHTML = "0";
		document.getElementById("highestbidder").innerHTML = "N/A";
		document.getElementById("currentbidder").innerHTML = player[currentbidder].name;
		document.getElementById("bid").onkeydown = function (e) {
			var key = 0;
			var isCtrl = false;
			var isShift = false;

			if (window.event) {
				key = window.event.keyCode;
				isCtrl = window.event.ctrlKey;
				isShift = window.event.shiftKey;
			} else if (e) {
				key = e.keyCode;
				isCtrl = e.ctrlKey;
				isShift = e.shiftKey;
			}

			if (isNaN(key)) {
				return true;
			}

			if (key === 13) {
				game.auctionBid();
				return false;
			}

			// Permite backspace, tab, delete, arrow keys, ou se o controle foi pressionado, respectivamente.
			if (key === 8 || key === 9 || key === 46 || (key >= 35 && key <= 40) || isCtrl) {
				return true;
			}

			if (isShift) {
				return false;
			}

			// Só permite números
			return (key >= 48 && key <= 57) || (key >= 96 && key <= 105);
		};

		document.getElementById("bid").onfocus = function () {
			this.style.color = "black";
			if (isNaN(this.value)) {
				this.value = "";
			}
		};

		updateMoney();

		if (!player[currentbidder].human) {
			currentbidder = turn; // passe do leilão avança o ofertante atual.
			this.auctionPass();
		}
		return true;
	};

	this.auctionPass = function() {
		if (highestbidder === 0) {
			highestbidder = currentbidder;
		}

		while (true) {
			currentbidder++;

			if (currentbidder > pcount) {
				currentbidder -= pcount;
			}

			if (currentbidder == highestbidder) {
				finalizeAuction();
				return;
			} else if (player[currentbidder].bidding) {
				var p = player[currentbidder];

				if (!p.human) {
					var bid = p.AI.bid(auctionproperty, highestbid);

					if (bid === -1 || highestbid >= p.money) {
						p.bidding = false;

						window.alert(p.name + " saiu da licitação.");
						continue;

					} else if (bid === 0) {
						window.alert(p.name + " passou.");
						continue;

					} else if (bid > 0) {
						this.auctionBid(bid);
						window.alert(p.name + " oferta $" + bid + ".");
						continue;
					}
					return;
				} else {
					break;
				}
			}

		}

		document.getElementById("currentbidder").innerHTML = player[currentbidder].name;
		document.getElementById("bid").value = "";
		document.getElementById("bid").style.color = "black";
	};

	this.auctionBid = function(bid) {
		bid = bid || parseInt(document.getElementById("bid").value, 10);

		if (bid === "" || bid === null) {
			document.getElementById("bid").value = "Entre com uma oferta.";
			document.getElementById("bid").style.color = "red";
		} else if (isNaN(bid)) {
			document.getElementById("bid").value = "Sua oferta precisa ser um número.";
			document.getElementById("bid").style.color = "red";
		} else {

			if (bid > player[currentbidder].money) {
				document.getElementById("bid").value = "Você não tem dinheiro suficiente para oefertar R$" + bid + ".";
				document.getElementById("bid").style.color = "red";
			} else if (bid > highestbid) {
				highestbid = bid;
				document.getElementById("highestbid").innerHTML = parseInt(bid, 10);
				highestbidder = currentbidder;
				document.getElementById("highestbidder").innerHTML = player[highestbidder].name;

				document.getElementById("bid").focus();

				if (player[currentbidder].human) {
					this.auctionPass();
				}
			} else {
				document.getElementById("bid").value = "Sua oferta deve ser maior que o último lance. (R$" + highestbid + ")";
				document.getElementById("bid").style.color = "red";
			}
		}
	};

	this.auctionExit = function() {
		player[currentbidder].bidding = false;
		this.auctionPass();
	};



	// funções de negociação

	var currentInitiator;
	var currentRecipient;

	// Define event handlers:

	var tradeMoneyOnKeyDown = function (e) {
		var key = 0;
		var isCtrl = false;
		var isShift = false;

		if (window.event) {
			key = window.event.keyCode;
			isCtrl = window.event.ctrlKey;
			isShift = window.event.shiftKey;
		} else if (e) {
			key = e.keyCode;
			isCtrl = e.ctrlKey;
			isShift = e.shiftKey;
		}

		if (isNaN(key)) {
			return true;
		}

		if (key === 13) {
			return false;
		}

		// Permitir backspace, tab, delete, teclas de seta ou se o controle foi pressionado, respectivamente.
		if (key === 8 || key === 9 || key === 46 || (key >= 35 && key <= 40) || isCtrl) {
			return true;
		}

		if (isShift) {
			return false;
		}

		// Só permite números
		return (key >= 48 && key <= 57) || (key >= 96 && key <= 105);
	};

	var tradeMoneyOnFocus = function () {
		this.style.color = "black";
		if (isNaN(this.value) || this.value === "0") {
			this.value = "";
		}
	};

	var tradeMoneyOnChange = function(e) {
		$("#proposetradebutton").show();
		$("#canceltradebutton").show();
		$("#accepttradebutton").hide();
		$("#rejecttradebutton").hide();

		var amount = this.value;

		if (isNaN(amount)) {
			this.value = "Valor precisa ser um número.";
			this.style.color = "red";
			return false;
		}

		amount = Math.round(amount) || 0;
		this.value = amount;

		if (amount < 0) {
			this.value = "O valor precisa ser maior que 0.";
			this.style.color = "red";
			return false;
		}

		return true;
	};

	document.getElementById("trade-leftp-money").onkeydown = tradeMoneyOnKeyDown;
	document.getElementById("trade-rightp-money").onkeydown = tradeMoneyOnKeyDown;
	document.getElementById("trade-leftp-money").onfocus = tradeMoneyOnFocus;
	document.getElementById("trade-rightp-money").onfocus = tradeMoneyOnFocus;
	document.getElementById("trade-leftp-money").onchange = tradeMoneyOnChange;
	document.getElementById("trade-rightp-money").onchange = tradeMoneyOnChange;

	var resetTrade = function(initiator, recipient, allowRecipientToBeChanged) {
		var currentquadro;
		var currentTableRow;
		var currentTableCell;
		var currentTableCellCheckbox;
		var nameSelect;
		var currentOption;
		var allGroupUninproved;
		var currentName;

		var tableRowOnClick = function(e) {
			var checkboxElement = this.firstChild.firstChild;

			if (checkboxElement !== e.srcElement) {
				checkboxElement.checked = !checkboxElement.checked;
			}

			$("#proposetradebutton").show();
			$("#canceltradebutton").show();
			$("#accepttradebutton").hide();
			$("#rejecttradebutton").hide();
		};

		var initiatorProperty = document.getElementById("trade-leftp-property");
		var recipientProperty = document.getElementById("trade-rightp-property");

		currentInitiator = initiator;
		currentRecipient = recipient;

		// Elementos vazios
		while (initiatorProperty.lastChild) {
			initiatorProperty.removeChild(initiatorProperty.lastChild);
		}

		while (recipientProperty.lastChild) {
			recipientProperty.removeChild(recipientProperty.lastChild);
		}

		var initiatorSideTable = document.createElement("table");
		var recipientSideTable = document.createElement("table");


		for (var i = 0; i < 40; i++) {
			currentquadro = quadro[i];

			// Uma propriedade não pode ser negociada se alguma propriedade em seu grupo tiver sido melhorada.
			if (currentquadro.house > 0 || currentquadro.groupNumber === 0) {
				continue;
			}

			allGroupUninproved = true;
			var max = currentquadro.group.length;
			for (var j = 0; j < max; j++) {

				if (quadro[currentquadro.group[j]].house > 0) {
					allGroupUninproved = false;
					break;
				}
			}

			if (!allGroupUninproved) {
				continue;
			}

			// Propriedades oferecidas
			if (currentquadro.owner === initiator.index) {
				currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
				currentTableRow.onclick = tableRowOnClick;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcheckbox";
				currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
				currentTableCellCheckbox.type = "checkbox";
				currentTableCellCheckbox.id = "tradeleftcheckbox" + i;
				currentTableCellCheckbox.title = "Marque essa caixa para incluir " + currentquadro.name + " na negociação";

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcolor";
				currentTableCell.style.backgroundColor = currentquadro.color;

				if (currentquadro.groupNumber == 1 || currentquadro.groupNumber == 2) {
					currentTableCell.style.borderColor = "grey";
				} else {
					currentTableCell.style.borderColor = currentquadro.color;
				}

				currentTableCell.propertyIndex = i;
				currentTableCell.onmouseover = function() {showdeed(this.propertyIndex);};
				currentTableCell.onmouseout = hidedeed;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellname";
				if (currentquadro.mortgage) {
					currentTableCell.title = "Hipotecado";
					currentTableCell.style.color = "grey";
				}
				currentTableCell.textContent = currentquadro.name;

			// Propriedades Solicitadas
			} else if (currentquadro.owner === recipient.index) {
				currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
				currentTableRow.onclick = tableRowOnClick;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcheckbox";
				currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
				currentTableCellCheckbox.type = "checkbox";
				currentTableCellCheckbox.id = "traderightcheckbox" + i;
				currentTableCellCheckbox.title = "Marque para incluir " + currentquadro.name + " na negociação.";

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcolor";
				currentTableCell.style.backgroundColor = currentquadro.color;

				if (currentquadro.groupNumber == 1 || currentquadro.groupNumber == 2) {
					currentTableCell.style.borderColor = "grey";
				} else {
					currentTableCell.style.borderColor = currentquadro.color;
				}

				currentTableCell.propertyIndex = i;
				currentTableCell.onmouseover = function() {showdeed(this.propertyIndex);};
				currentTableCell.onmouseout = hidedeed;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellname";
				if (currentquadro.mortgage) {
					currentTableCell.title = "Hipotecado";
					currentTableCell.style.color = "grey";
				}
				currentTableCell.textContent = currentquadro.name;
			}
		}

		if (initiator.communityChestJailCard) {
			currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
			currentTableRow.onclick = tableRowOnClick;

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellcheckbox";
			currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
			currentTableCellCheckbox.type = "checkbox";
			currentTableCellCheckbox.id = "tradeleftcheckbox40";
			currentTableCellCheckbox.title = "Marque para incluir este cartão 'Saia da Prisão com Cartão Grátis' na troca.";

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellcolor";
			currentTableCell.style.backgroundColor = "white";
			currentTableCell.style.borderColor = "grey";

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellname";

			currentTableCell.textContent = "Saia da Prisão com Cartão Grátis";
		} else if (recipient.communityChestJailCard) {
			currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
			currentTableRow.onclick = tableRowOnClick;

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellcheckbox";
			currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
			currentTableCellCheckbox.type = "checkbox";
			currentTableCellCheckbox.id = "traderightcheckbox40";
			currentTableCellCheckbox.title = "Marque para incluir este cartão 'Saia da Prisão com Cartão Grátis' na troca.";

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellcolor";
			currentTableCell.style.backgroundColor = "white";
			currentTableCell.style.borderColor = "grey";

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellname";

			currentTableCell.textContent = "Saia da Prisão com Cartão Grátis";
		}

		if (initiator.chanceJailCard) {
			currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
			currentTableRow.onclick = tableRowOnClick;

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellcheckbox";
			currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
			currentTableCellCheckbox.type = "checkbox";
			currentTableCellCheckbox.id = "tradeleftcheckbox41";
			currentTableCellCheckbox.title = "Marque para incluir este cartão 'Saia da Prisão com Cartão Grátis' na troca.";

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellcolor";
			currentTableCell.style.backgroundColor = "white";
			currentTableCell.style.borderColor = "grey";

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellname";

			currentTableCell.textContent = "Saia da Prisão com Cartão Grátis";
		} else if (recipient.chanceJailCard) {
			currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
			currentTableRow.onclick = tableRowOnClick;

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellcheckbox";
			currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
			currentTableCellCheckbox.type = "checkbox";
			currentTableCellCheckbox.id = "traderightcheckbox41";
			currentTableCellCheckbox.title = "Marque para incluir este cartão 'Saia da Prisão com Cartão Grátis' na troca.";

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellcolor";
			currentTableCell.style.backgroundColor = "white";
			currentTableCell.style.borderColor = "grey";

			currentTableCell = currentTableRow.appendChild(document.createElement("td"));
			currentTableCell.className = "propertycellname";

			currentTableCell.textContent = "Saia da Prisão com Cartão Grátis";
		}

		if (initiatorSideTable.lastChild) {
			initiatorProperty.appendChild(initiatorSideTable);
		} else {
			initiatorProperty.textContent = initiator.name + " não possui pripriedades para negociar.";
		}

		if (recipientSideTable.lastChild) {
			recipientProperty.appendChild(recipientSideTable);
		} else {
			recipientProperty.textContent = recipient.name + " não possui pripriedades para negociar.";
		}

		document.getElementById("trade-leftp-name").textContent = initiator.name;

		currentName = document.getElementById("trade-rightp-name");

		if (allowRecipientToBeChanged && pcount > 2) {
			// Empty element.
			while (currentName.lastChild) {
				currentName.removeChild(currentName.lastChild);
			}

			nameSelect = currentName.appendChild(document.createElement("select"));
			for (var i = 1; i <= pcount; i++) {
				if (i === initiator.index) {
					continue;
				}

				currentOption = nameSelect.appendChild(document.createElement("option"));
				currentOption.value = i + "";
				currentOption.style.color = player[i].color;
				currentOption.textContent = player[i].name;

				if (i === recipient.index) {
					currentOption.selected = "selected";
				}
			}

			nameSelect.onchange = function() {
				resetTrade(currentInitiator, player[parseInt(this.value, 10)], true);
			};

			nameSelect.title = "Escolha um jogador para iniciar a negociação.";
		} else {
			currentName.textContent = recipient.name;
		}

		document.getElementById("trade-leftp-money").value = "0";
		document.getElementById("trade-rightp-money").value = "0";

	};

	var readTrade = function() {
		var initiator = currentInitiator;
		var recipient = currentRecipient;
		var property = new Array(40);
		var money;
		var communityChestJailCard;
		var chanceJailCard;

		for (var i = 0; i < 40; i++) {

			if (document.getElementById("tradeleftcheckbox" + i) && document.getElementById("tradeleftcheckbox" + i).checked) {
				property[i] = 1;
			} else if (document.getElementById("traderightcheckbox" + i) && document.getElementById("traderightcheckbox" + i).checked) {
				property[i] = -1;
			} else {
				property[i] = 0;
			}
		}

		if (document.getElementById("tradeleftcheckbox40") && document.getElementById("tradeleftcheckbox40").checked) {
			communityChestJailCard = 1;
		} else if (document.getElementById("traderightcheckbox40") && document.getElementById("traderightcheckbox40").checked) {
			communityChestJailCard = -1;
		} else {
			communityChestJailCard = 0;
		}

		if (document.getElementById("tradeleftcheckbox41") && document.getElementById("tradeleftcheckbox41").checked) {
			chanceJailCard = 1;
		} else if (document.getElementById("traderightcheckbox41") && document.getElementById("traderightcheckbox41").checked) {
			chanceJailCard = -1;
		} else {
			chanceJailCard = 0;
		}

		money = parseInt(document.getElementById("trade-leftp-money").value, 10) || 0;
		money -= parseInt(document.getElementById("trade-rightp-money").value, 10) || 0;

		var trade = new Trade(initiator, recipient, money, property, communityChestJailCard, chanceJailCard);

		return trade;
	};

	var writeTrade = function(tradeObj) {
		resetTrade(tradeObj.getInitiator(), tradeObj.getRecipient(), false);

		for (var i = 0; i < 40; i++) {

			if (document.getElementById("tradeleftcheckbox" + i)) {
				document.getElementById("tradeleftcheckbox" + i).checked = false;
				if (tradeObj.getProperty(i) === 1) {
					document.getElementById("tradeleftcheckbox" + i).checked = true;
				}
			}

			if (document.getElementById("traderightcheckbox" + i)) {
				document.getElementById("traderightcheckbox" + i).checked = false;
				if (tradeObj.getProperty(i) === -1) {
					document.getElementById("traderightcheckbox" + i).checked = true;
				}
			}
		}

		if (document.getElementById("tradeleftcheckbox40")) {
			if (tradeObj.getCommunityChestJailCard() === 1) {
				document.getElementById("tradeleftcheckbox40").checked = true;
			} else {
				document.getElementById("tradeleftcheckbox40").checked = false;
			}
		}

		if (document.getElementById("traderightcheckbox40")) {
			if (tradeObj.getCommunityChestJailCard() === -1) {
				document.getElementById("traderightcheckbox40").checked = true;
			} else {
				document.getElementById("traderightcheckbox40").checked = false;
			}
		}

		if (document.getElementById("tradeleftcheckbox41")) {
			if (tradeObj.getChanceJailCard() === 1) {
				document.getElementById("tradeleftcheckbox41").checked = true;
			} else {
				document.getElementById("tradeleftcheckbox41").checked = false;
			}
		}

		if (document.getElementById("traderightcheckbox41")) {
			if (tradeObj.getChanceJailCard() === -1) {
				document.getElementById("traderightcheckbox41").checked = true;
			} else {
				document.getElementById("traderightcheckbox41").checked = false;
			}
		}

		if (tradeObj.getMoney() > 0) {
			document.getElementById("trade-leftp-money").value = tradeObj.getMoney() + "";
		} else {
			document.getElementById("trade-rightp-money").value = (-tradeObj.getMoney()) + "";
		}

	};

	this.trade = function(tradeObj) {
		$("#board").hide();
		$("#control").hide();
		$("#trade").show();
		$("#proposetradebutton").show();
		$("#canceltradebutton").show();
		$("#accepttradebutton").hide();
		$("#rejecttradebutton").hide();

		if (tradeObj instanceof Trade) {
			writeTrade(tradeObj);
			this.proposeTrade();
		} else {
			var initiator = player[turn];
			var recipient = turn === 1 ? player[2] : player[1];

			currentInitiator = initiator;
			currentRecipient = recipient;

			resetTrade(initiator, recipient, true);
		}
	};


	this.cancelTrade = function() {
		$("#board").show();
		$("#control").show();
		$("#trade").hide();


		if (!player[turn].human) {
			player[turn].AI.alertList = "";
			game.next();
		}

	};

	this.acceptTrade = function(tradeObj) {
		if (isNaN(document.getElementById("trade-leftp-money").value)) {
			document.getElementById("trade-leftp-money").value = "Este valor precisa ser um número.";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		}

		if (isNaN(document.getElementById("trade-rightp-money").value)) {
			document.getElementById("trade-rightp-money").value = "Este valor precisa ser um número.";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var showAlerts = true;
		var money;
		var initiator;
		var recipient;

		if (tradeObj) {
			showAlerts = false;
		} else {
			tradeObj = readTrade();
		}

		money = tradeObj.getMoney();
		initiator = tradeObj.getInitiator();
		recipient = tradeObj.getRecipient();


		if (money > 0 && money > initiator.money) {
			document.getElementById("trade-leftp-money").value = initiator.name + " não possui R$" + money + ".";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		} else if (money < 0 && -money > recipient.money) {
			document.getElementById("trade-rightp-money").value = recipient.name + " não possui R$" + (-money) + ".";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var isAPropertySelected = 0;

		// Garante de que algumas propriedades estejam selecionadas.
		for (var i = 0; i < 40; i++) {
			isAPropertySelected |= tradeObj.getProperty(i);
		}

		isAPropertySelected |= tradeObj.getCommunityChestJailCard();
		isAPropertySelected |= tradeObj.getChanceJailCard();

		if (isAPropertySelected === 0) {
			popup("<p>OUma ou mais propriedades devem ser selecionadas para negociar.</p>");

			return false;
		}

		if (showAlerts && !confirm(initiator.name + ", tem certeza de que deseja fazer esta troca com " + recipient.name + "?")) {
			return false;
		}

		// Propriedades da troca
		for (var i = 0; i < 40; i++) {

			if (tradeObj.getProperty(i) === 1) {
				quadro[i].owner = recipient.index;
				addAlert(recipient.name + " received " + quadro[i].name + " from " + initiator.name + ".");
			} else if (tradeObj.getProperty(i) === -1) {
				quadro[i].owner = initiator.index;
				addAlert(initiator.name + " received " + quadro[i].name + " from " + recipient.name + ".");
			}

		}

		if (tradeObj.getCommunityChestJailCard() === 1) {
			initiator.communityChestJailCard = false;
			recipient.communityChestJailCard = true;
			addAlert(recipient.name + ' recebeu um cartão "Saia de Graça da Prisão" de ' + initiator.name + ".");
		} else if (tradeObj.getCommunityChestJailCard() === -1) {
			initiator.communityChestJailCard = true;
			recipient.communityChestJailCard = false;
			addAlert(initiator.name + ' recebeu um cartão "Saia de Graça da Prisão" de ' + recipient.name + ".");
		}

		if (tradeObj.getChanceJailCard() === 1) {
			initiator.chanceJailCard = false;
			recipient.chanceJailCard = true;
			addAlert(recipient.name + ' recebeu um cartão "Saia de Graça da Prisão" de '  + initiator.name + ".");
		} else if (tradeObj.getChanceJailCard() === -1) {
			initiator.chanceJailCard = true;
			recipient.chanceJailCard = false;
			addAlert(initiator.name + ' recebeu um cartão "Saia de Graça da Prisão" de '  + recipient.name + ".");
		}

		// Exchange money.
		if (money > 0) {
			initiator.pay(money, recipient.index);
			recipient.money += money;

			addAlert(recipient.name + " recebeu R$" + money + " de " + initiator.name + ".");
		} else if (money < 0) {
			money = -money;

			recipient.pay(money, initiator.index);
			initiator.money += money;

			addAlert(initiator.name + " recebeu R$" + money + " de " + recipient.name + ".");
		}

		updateOwned();
		updateMoney();

		$("#board").show();
		$("#control").show();
		$("#trade").hide();

		if (!player[turn].human) {
			player[turn].AI.alertList = "";
			game.next();
		}
	};

	this.proposeTrade = function() {
		if (isNaN(document.getElementById("trade-leftp-money").value)) {
			document.getElementById("trade-leftp-money").value = "Este valor precisa ser um número.";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		}

		if (isNaN(document.getElementById("trade-rightp-money").value)) {
			document.getElementById("trade-rightp-money").value = "Este valor precisa ser um número.";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var tradeObj = readTrade();
		var money = tradeObj.getMoney();
		var initiator = tradeObj.getInitiator();
		var recipient = tradeObj.getRecipient();
		var reversedTradeProperty = [];

		if (money > 0 && money > initiator.money) {
			document.getElementById("trade-leftp-money").value = initiator.name + " não tem R$" + money + ".";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		} else if (money < 0 && -money > recipient.money) {
			document.getElementById("trade-rightp-money").value = recipient.name + " não tem R$" + (-money) + ".";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var isAPropertySelected = 0;
		
		for (var i = 0; i < 40; i++) {
			reversedTradeProperty[i] = -tradeObj.getProperty(i);
			isAPropertySelected |= tradeObj.getProperty(i);
		}

		isAPropertySelected |= tradeObj.getCommunityChestJailCard();
		isAPropertySelected |= tradeObj.getChanceJailCard();

		if (isAPropertySelected === 0) {
			popup("<p>Uma ou mais propriedades devem ser selecionadas para negociar.</p>");

			return false;
		}

		if (initiator.human && !confirm(initiator.name + ", tem certeza de que deseja fazer esta oferta para " + recipient.name + "?")) {
			return false;
		}

		var reversedTrade = new Trade(recipient, initiator, -money, reversedTradeProperty, -tradeObj.getCommunityChestJailCard(), -tradeObj.getChanceJailCard());

		if (recipient.human) {

			writeTrade(reversedTrade);

			$("#proposetradebutton").hide();
			$("#canceltradebutton").hide();
			$("#accepttradebutton").show();
			$("#rejecttradebutton").show();

			addAlert(initiator.name + " initiated a trade with " + recipient.name + ".");
			popup("<p>" + initiator.name + " has proposed a trade with you, " + recipient.name + ". You may accept, reject, or modify the offer.</p>");
		} else {
			var tradeResponse = recipient.AI.acceptTrade(tradeObj);

			if (tradeResponse === true) {
				popup("<p>" + recipient.name + " has accepted your offer.</p>");
				this.acceptTrade(reversedTrade);
			} else if (tradeResponse === false) {
				popup("<p>" + recipient.name + " has declined your offer.</p>");
				return;
			} else if (tradeResponse instanceof Trade) {
				popup("<p>" + recipient.name + " has proposed a counteroffer.</p>");
				writeTrade(tradeResponse);

				$("#proposetradebutton, #canceltradebutton").hide();
				$("#accepttradebutton").show();
				$("#rejecttradebutton").show();
			}
		}
	};

	// funções de falência


	this.eliminatePlayer = function() {
		var p = player[turn];

		for (var i = p.index; i < pcount; i++) {
			player[i] = player[i + 1];
			player[i].index = i;

		}

		for (var i = 0; i < 40; i++) {
			if (quadro[i].owner >= p.index) {
				quadro[i].owner--;
			}
		}

		pcount--;
		turn--;

		if (pcount === 2) {
			document.getElementById("stats").style.width = "454px";
		} else if (pcount === 3) {
			document.getElementById("stats").style.width = "686px";
		}

		if (pcount === 1) {
			updateMoney();
			$("#control").hide();
			$("#board").hide();
			$("#refresh").show();			

			popup("<p>Parabéns, " + player[1].name + ", você venceu o jogo.</p><div>");

		} else {
			play();
		}
	};

	this.bankruptcyUnmortgage = function() {
		var p = player[turn];

		if (p.creditor === 0) {
			game.eliminatePlayer();
			return;
		}

		var HTML = "<p>" + player[p.creditor].name + ", você pode cancelar a hipoteca de qualquer um dos seguintes imóveis, sem juros, clicando neles. Clique em OK quando terminar.</p><table>";
		var price;

		for (var i = 0; i < 40; i++) {
			sq = quadro[i];
			if (sq.owner == p.index && sq.mortgage) {
				price = Math.round(sq.price * 0.5);

				HTML += "<tr><td class='propertycellcolor' style='background: " + sq.color + ";";

				if (sq.groupNumber == 1 || sq.groupNumber == 2) {
					HTML += " border: 1px solid grey;";
				} else {
					HTML += " border: 1px solid " + sq.color + ";";
				}

				// O jogador já pagou juros, então eles podem cancelar a hipoteca pelo preço da hipoteca.
				HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname'><a href='javascript:void(0);' title='Unmortgage " + sq.name + " for $" + price + ".' onclick='if (" + price + " <= player[" + p.creditor + "].money) {player[" + p.creditor + "].pay(" + price + ", 0); quadro[" + i + "].mortgage = false; addAlert(\"" + player[p.creditor].name + " unmortgaged " + sq.name + " for $" + price + ".\");} this.parentElement.parentElement.style.display = \"none\";'>Unmortgage " + sq.name + " ($" + price + ")</a></td></tr>";

				sq.owner = p.creditor;

			}
		}

		HTML += "</table>";

		popup(HTML, game.eliminatePlayer);
	};

	this.resign = function() {
		popup("<p>Tem certeza que deseja declarar falência?</p>", game.bankruptcy, "Sim/Não");
	};

	this.bankruptcy = function() {
		var p = player[turn];
		var pcredit = player[p.creditor];
		var bankruptcyUnmortgageFee = 0;


		if (p.money >= 0) {
			return;
		}

		addAlert(p.name + " está falido.");

		if (p.creditor !== 0) {
			pcredit.money += p.money;
		}

		for (var i = 0; i < 40; i++) {
			sq = quadro[i];
			if (sq.owner == p.index) {
				// As propriedades hipotecadas serão transferidas por hipoteca pela função bankruptcyUnmortgage();
				if (!sq.mortgage) {
					sq.owner = p.creditor;
				} else {
					bankruptcyUnmortgageFee += Math.round(sq.price * 0.1);
				}

				if (sq.house > 0) {
					if (p.creditor !== 0) {
						pcredit.money += sq.houseprice * 0.5 * sq.house;
					}
					sq.hotel = 0;
					sq.house = 0;
				}

				if (p.creditor === 0) {
					sq.mortgage = false;
					game.addPropertyToAuctionQueue(i);
					sq.owner = 0;
				}
			}
		}

		updateMoney();

		if (p.chanceJailCard) {
			p.chanceJailCard = false;
			pcredit.chanceJailCard = true;
		}

		if (p.communityChestJailCard) {
			p.communityChestJailCard = false;
			pcredit.communityChestJailCard = true;
		}

		if (pcount === 2 || bankruptcyUnmortgageFee === 0 || p.creditor === 0) {
			game.eliminatePlayer();
		} else {
			addAlert(pcredit.name + " pagou R$" + bankruptcyUnmortgageFee + " juros sobre os imóveis hipotecados recebidos de " + p.name + ".");
			popup("<p>" + pcredit.name + ", você terá que pagar R$" + bankruptcyUnmortgageFee + " juros sobre as propriedades hipotecadas que você recebeu de " + p.name + ".</p>", function() {player[pcredit.index].pay(bankruptcyUnmortgageFee, 0); game.bankruptcyUnmortgage();});
		}
	};

}

var game;


function Player(name, color) {
	this.name = name;
	this.color = color;
	this.position = 0;
	this.money = 1500;
	this.creditor = -1;
	this.jail = false;
	this.jailroll = 0;
	this.communityChestJailCard = false;
	this.chanceJailCard = false;
	this.bidding = true;
	this.human = true;
	// this.AI = null;

	this.pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.money -= amount;

			updateMoney();

			return true;
		} else {
			this.money -= amount;
			this.creditor = creditor;

			updateMoney();

			return false;
		}
	};
}


function Trade(initiator, recipient, money, property, communityChestJailCard, chanceJailCard) {

	this.getInitiator = function() {
		return initiator;
	};

	this.getRecipient = function() {
		return recipient;
	};

	this.getProperty = function(index) {
		return property[index];
	};

	this.getMoney = function() {
		return money;
	};

	this.getCommunityChestJailCard = function() {
		return communityChestJailCard;
	};

	this.getChanceJailCard = function() {
		return chanceJailCard;
	};
}

var player = [];
var pcount;
var turn = 0, doublecount = 0;

Array.prototype.randomize = function(length) {
	length = (length || this.length);
	var num;
	var indexArray = [];

	for (var i = 0; i < length; i++) {
		indexArray[i] = i;
	}

	for (var i = 0; i < length; i++) {
		num = Math.floor(Math.random() * indexArray.length);
		this[i] = indexArray[num] + 1;

		indexArray.splice(num, 1);
	}
};


function addAlert(alertText) {
	$alert = $("#alert");

	$(document.createElement("div")).text(alertText).appendTo($alert);

	// Animate scrolling down alert element.
	$alert.stop().animate({"scrollTop": $alert.prop("scrollHeight")}, 1000);

	if (!player[turn].human) {
		player[turn].AI.alertList += "<div>" + alertText + "</div>";
	}
}

function popup(HTML, action, option) {
	document.getElementById("popuptext").innerHTML = HTML;
	document.getElementById("popup").style.width = "300px";
	document.getElementById("popup").style.top = "0px";
	document.getElementById("popup").style.left = "0px";

	if (!option && typeof action === "string") {
		option = action;
	}

	option = option ? option.toLowerCase() : "";

	if (typeof action !== "function") {
		action = null;
	}

	// Yes/No
	if (option === "yes/no") {
		document.getElementById("popuptext").innerHTML += "<div><input type=\"button\" value=\"Yes\" id=\"popupyes\" class=\"btn btn-primary mr-2 ml-2 mt-2 mb-2\" /><input type=\"button\" value=\"No\" id=\"popupno\" class=\"btn btn-primary mr-2 ml-2 mt-2 mb-2\" /></div>";

		$("#popupyes, #popupno").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		});

		$("#popupyes").on("click", action);

	// Ok
	} else if (option !== "blank") {
		$("#popuptext").append("<div><input type='button' value='OK' id='popupclose' class='btn btn-primary btn-sm mt-2' /></div>");
		$("#popupclose").focus();

		$("#popupclose").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		}).on("click", action);

	}

	// Show using animation.
	$("#popupbackground").fadeIn(400, function() {
		$("#popupwrap").show();
	});

}


function updatePosition() {
	// Reset borders
	document.getElementById("jail").style.border = "1px solid black";
	document.getElementById("jailpositionholder").innerHTML = "";
	for (var i = 0; i < 40; i++) {
		document.getElementById("cell" + i).style.border = "1px solid black";
		document.getElementById("cell" + i + "positionholder").innerHTML = "";

	}

	var sq, left, top;

	for (var x = 0; x < 40; x++) {
		sq = quadro[x];
		left = 0;
		top = 0;

		for (var y = turn; y <= pcount; y++) {

			if (player[y].position == x && !player[y].jail) {

				document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + ";" + "0px" + "px; top: " + "0px" + "px;'></div>";
				if (left == 36) {
					left = 0;
					top = 12;
				} else
					left += 12;
			}
		}

		for (var y = 1; y < turn; y++) {

			if (player[y].position == x && !player[y].jail) {
				document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + "; left: " + "0px" + "px; top: " + "0px" + "px;'></div>";
				if (left == 36) {
					left = 0;
					top = 12;
				} else
					left += 12;
			}
		}
	}

	left = 0;
	top = 53;
	for (var i = turn; i <= pcount; i++) {
		if (player[i].jail) {
			document.getElementById("jailpositionholder").innerHTML += "<div class='cell-position' title='" + player[i].name + "' style='background-color: " + player[i].color + "; left: " + "0px" + "px; top: " + "0px" + "px;'></div>";

			if (left === 36) {
				left = 0;
				top = 41;
			} else {
				left += 12;
			}
		}
	}

	for (var i = 1; i < turn; i++) {
		if (player[i].jail) {
			document.getElementById("jailpositionholder").innerHTML += "<div class='cell-position' title='" + player[i].name + "' style='background-color: " + player[i].color + "; left: " + "0px" + "px; top: " + "0px" + "px;'></div>";
			if (left === 36) {
				left = 0;
				top = 41;
			} else
				left += 12;
		}
	}

	p = player[turn];

	if (p.jail) {
		document.getElementById("jail").style.border = "1px solid " + p.color;
	} else {
		document.getElementById("cell" + p.position).style.border = "1px solid " + p.color;
	}

	// for (var i=1; i <= pcount; i++) {
	// document.getElementById("enlarge"+player[i].position+"token").innerHTML+="<img src='"+tokenArray[i].src+"' height='30' width='30' />";
	// }
}

function updateMoney() {
	var p = player[turn];

	document.getElementById("pmoney").innerHTML = "$" + p.money;
	$(".money-bar-row").hide();

	for (var i = 1; i <= pcount; i++) {
		p_i = player[i];

		$("#moneybarrow" + i).show();
		document.getElementById("p" + i + "moneybar").style.border = "2px solid " + p_i.color;
		document.getElementById("p" + i + "money").innerHTML = p_i.money;
		document.getElementById("p" + i + "moneyname").innerHTML = p_i.name;
	}

	if (document.getElementById("landed").innerHTML === "") {
		$("#landed").hide();
	}

	document.getElementById("quickstats").style.borderColor = p.color;

	if (p.money < 0) {
		// document.getElementById("nextbutton").disabled = true;
		$("#resignbutton").show();
		$("#nextbutton").hide();
	} else {
		// document.getElementById("nextbutton").disabled = false;
		$("#resignbutton").hide();
		$("#nextbutton").show();
	}
}

function updateDice() {
	var die0 = game.getDie(1);
	var die1 = game.getDie(2);

	$("#die0").show();
	$("#die1").show();

	if (document.images) {
		var element0 = document.getElementById("die0");
		var element1 = document.getElementById("die1");

		element0.classList.remove("die-no-img");
		element1.classList.remove("die-no-img");

		element0.title = "Dado (" + die0 + " pontos)";
		element1.title = "Dado (" + die1 + " pontos)";

		if (element0.firstChild) {
			element0 = element0.firstChild;
		} else {
			element0 = element0.appendChild(document.createElement("img"));
		}

		element0.src = "img/dado_" + die0 + ".png";
		element0.alt = die0;

		if (element1.firstChild) {
			element1 = element1.firstChild;
		} else {
			element1 = element1.appendChild(document.createElement("img"));
		}

		element1.src = "img/dado_" + die1 + ".png";
		element1.alt = die0;
	} else {
		document.getElementById("die0").textContent = die0;
		document.getElementById("die1").textContent = die1;

		document.getElementById("die0").title = "Dado";
		document.getElementById("die1").title = "Dado";
	}
}

function updateOwned() {
	var p = player[turn];
	var checkedproperty = getCheckedProperty();
	$("#option").show();
	$("#owned").show();

	var HTML = "",
	firstproperty = -1;

	var mortgagetext = "",
	housetext = "";
	var sq;

	for (var i = 0; i < 40; i++) {
		sq = quadro[i];
		if (sq.groupNumber && sq.owner === 0) {
			$("#cell" + i + "owner").hide();
		} else if (sq.groupNumber && sq.owner > 0) {
			var currentCellOwner = document.getElementById("cell" + i + "owner");

			currentCellOwner.style.display = "block";
			currentCellOwner.style.backgroundColor = player[sq.owner].color;
			currentCellOwner.title = player[sq.owner].name;
		}
	}

	for (var i = 0; i < 40; i++) {
		sq = quadro[i];
		if (sq.owner == turn) {

			mortgagetext = "";
			if (sq.mortgage) {
				mortgagetext = "title='Hipotecado' style='color: grey;'";
			}

			housetext = "";
			if (sq.house >= 1 && sq.house <= 4) {
				for (var x = 1; x <= sq.house; x++) {
					housetext += "<img src='img/house.png' alt='' title='House' class='house' />";
				}
			} else if (sq.hotel) {
				housetext += "<img src='img/hotel.png' alt='' title='Hotel' class='hotel' />";
			}

			if (HTML === "") {
				HTML += "<table>";
				firstproperty = i;
			}

			HTML += "<tr class='property-cell-row'><td class='propertycellcheckbox'><input type='checkbox' id='propertycheckbox" + i + "' /></td><td class='propertycellcolor' style='background: " + sq.color + ";";

			if (sq.groupNumber == 1 || sq.groupNumber == 2) {
				HTML += " border: 1px solid grey; width: 18px;";
			}

			HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname' " + mortgagetext + ">" + sq.name + housetext + "</td></tr>";
		}
	}

	if (p.communityChestJailCard) {
		if (HTML === "") {
			firstproperty = 40;
			HTML += "<table>";
		}
		HTML += "<tr class='property-cell-row'><td class='propertycellcheckbox'><input type='checkbox' id='propertycheckbox40' /></td><td class='propertycellcolor' style='background: white;'></td><td class='propertycellname'>Get Out of Jail Free Card</td></tr>";

	}
	if (p.chanceJailCard) {
		if (HTML === "") {
			firstproperty = 41;
			HTML += "<table>";
		}
		HTML += "<tr class='property-cell-row'><td class='propertycellcheckbox'><input type='checkbox' id='propertycheckbox41' /></td><td class='propertycellcolor' style='background: white;'></td><td class='propertycellname'>Get Out of Jail Free Card</td></tr>";
	}

	if (HTML === "") {
		HTML = p.name + ", você não possui nenhuma propriedade.";
		$("#option").hide();
	} else {
		HTML += "</table>";
	}

	document.getElementById("owned").innerHTML = HTML;

	// Escolhe a propriedade selecionada anteriormente
	if (checkedproperty > -1 && document.getElementById("propertycheckbox" + checkedproperty)) {
		document.getElementById("propertycheckbox" + checkedproperty).checked = true;
	} else if (firstproperty > -1) {
		document.getElementById("propertycheckbox" + firstproperty).checked = true;
	}
	$(".property-cell-row").click(function() {
		var row = this;

		
		$(this).find(".propertycellcheckbox > input").prop("checked", function(index, val) {
			return !val;
		});

		// Muda todos os outros checkbox para falso
		$(".propertycellcheckbox > input").prop("checked", function(index, val) {
			if (!$.contains(row, this)) {
				return false;
			}
		});

		updateOption();
	});
	updateOption();
}

function updateOption() {
	$("#option").show();

	var allGroupUninproved = true;
	var allGroupUnmortgaged = true;
	var checkedproperty = getCheckedProperty();

	if (checkedproperty < 0 || checkedproperty >= 40) {
		$("#buyhousebutton").hide();
		$("#sellhousebutton").hide();
		$("#mortgagebutton").hide();


		var housesum = 32;
		var hotelsum = 12;

		for (var i = 0; i < 40; i++) {
			s = quadro[i];
			if (s.hotel == 1)
				hotelsum--;
			else
				housesum -= s.house;
		}

		$("#buildings").show();
		document.getElementById("buildings").innerHTML = "<img src='img/house.png' alt='' title='House' class='house' />:&nbsp;" + housesum + "&nbsp;&nbsp;<img src='img/hotel.png' alt='' title='Hotel' class='hotel' />:&nbsp;" + hotelsum;

		return;
	}

	$("#buildings").hide();
	var sq = quadro[checkedproperty];

	buyhousebutton = document.getElementById("buyhousebutton");
	sellhousebutton = document.getElementById("sellhousebutton");

	$("#mortgagebutton").show();
	document.getElementById("mortgagebutton").disabled = false;

	if (sq.mortgage) {
		document.getElementById("mortgagebutton").value = "Unmortgage ($" + Math.round(sq.price * 0.55) + ")";
		document.getElementById("mortgagebutton").title = "Unmortgage " + sq.name + " for $" + Math.round(sq.price * 0.55) + ".";
		$("#buyhousebutton").hide();
		$("#sellhousebutton").hide();

		allGroupUnmortgaged = false;
	} else {
		document.getElementById("mortgagebutton").value = "Hopoteca ($" + (sq.price * 0.5) + ")";
		document.getElementById("mortgagebutton").title = "Hopoteca " + sq.name + " for $" + (sq.price * 0.5) + ".";

		if (sq.groupNumber >= 3) {
			$("#buyhousebutton").show();
			$("#sellhousebutton").show();
			buyhousebutton.disabled = false;
			sellhousebutton.disabled = false;

			buyhousebutton.value = "Comprar casa(R$" + sq.houseprice + ")";
			sellhousebutton.value = "Vender casa (R$" + (sq.houseprice * 0.5) + ")";
			buyhousebutton.title = "Comprar casa por R$" + sq.houseprice;
			sellhousebutton.title = "Vender casa por R$" + (sq.houseprice * 0.5);

			if (sq.house == 4) {
				buyhousebutton.value = "Comprar hotel (R$" + sq.houseprice + ")";
				buyhousebutton.title = "Comprar hotel por R$" + sq.houseprice;
			}
			if (sq.hotel == 1) {
				$("#buyhousebutton").hide();
				sellhousebutton.value = "Vender hotel (R$" + (sq.houseprice * 0.5) + ")";
				sellhousebutton.title = "Vender hotel por R$" + (sq.houseprice * 0.5);
			}

			var maxhouse = 0;
			var minhouse = 5;

			for (var j = 0; j < max; j++) {

				if (quadro[currentquadro.group[j]].house > 0) {
					allGroupUninproved = false;
					break;
				}
			}

			var max = sq.group.length;
			for (var i = 0; i < max; i++) {
				s = quadro[sq.group[i]];

				if (s.owner !== sq.owner) {
					buyhousebutton.disabled = true;
					sellhousebutton.disabled = true;
					buyhousebutton.title = "Antes de comprar uma casa, você deve possuir todas as propriedades deste grupo de cores.";
				} else {

					if (s.house > maxhouse) {
						maxhouse = s.house;
					}

					if (s.house < minhouse) {
						minhouse = s.house;
					}

					if (s.house > 0) {
						allGroupUninproved = false;
					}

					if (s.mortgage) {
						allGroupUnmortgaged = false;
					}
				}
			}

			if (!allGroupUnmortgaged) {
				buyhousebutton.disabled = true;
				buyhousebutton.title = "Antes de comprar uma casa, você deve desembolsar todas as propriedades desse grupo de cores.";
			}

			
			if (sq.house > minhouse) {
				buyhousebutton.disabled = true;

				if (sq.house == 1) {
					buyhousebutton.title = "Antes que você possa comprar outra casa, todas as outras propriedades deste grupo de cores devem ter uma casa.";
				} else if (sq.house == 4) {
					buyhousebutton.title = "Antes que você possa comprar um hotel, as outras propriedades deste grupo de cores devem ter 4 casas.";
				} else {
					buyhousebutton.title = "Antes de comprar uma casa, todas as outras propriedades deste grupo de cores devem ter " + sq.house + " casas.";
				}
			}
			if (sq.house < maxhouse) {
				sellhousebutton.disabled = true;

				if (sq.house == 1) {
					sellhousebutton.title = "Antes de poder vender uma casa, todas as outras propriedades deste grupo de cores devem ter uma casa.";
				} else {
					sellhousebutton.title = "Antes que você possa vender uma casa, todas as outras propriedades deste grupo de cores devem ter" + sq.house + " casas.";
				}
			}

			if (sq.house === 0 && sq.hotel === 0) {
				$("#sellhousebutton").hide();

			} else {
				$("#mortgagebutton").hide();

			}

			if (!allGroupUninproved) {
				document.getElementById("mortgagebutton").title = "Antes que uma propriedade possa ser hipotecada, todas as propriedades de seu grupo de cores não devem ser melhoradas.";
				document.getElementById("mortgagebutton").disabled = true;
			}

		} else {
			$("#buyhousebutton").hide();
			$("#sellhousebutton").hide();
		}
	}
}

function chanceCommunityChest() {
	var p = player[turn];

	// Baú da Comunidade
	if (p.position === 2 || p.position === 17 || p.position === 33) {
		var communityChestIndex = cartaBauDaComunidade.deck[cartaBauDaComunidade.index];

		// Remove the get out of jail free card from the deck.
		if (communityChestIndex === 0) {
			cartaBauDaComunidade.deck.splice(cartaBauDaComunidade.index, 1);
		}

		popup("<img src='img/community_chest_icon.png' style='height: 50px; width: 53px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Baú da Comunidade:</div><div style='text-align: justify;'>" + cartaBauDaComunidade[communityChestIndex].text + "</div>", function() {
			communityChestAction(communityChestIndex);
		});

		cartaBauDaComunidade.index++;

		if (cartaBauDaComunidade.index >= cartaBauDaComunidade.deck.length) {
			cartaBauDaComunidade.index = 0;
		}

	// Chance
	} else if (p.position === 7 || p.position === 22 || p.position === 36) {
		var chanceIndex = cartaCance.deck[cartaCance.index];

		
		if (chanceIndex === 0) {
			cartaCance.deck.splice(cartaCance.index, 1);
		}

		popup("<img src='img/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Chance:</div><div style='text-align: justify;'>" + cartaCance[chanceIndex].text + "</div>", function() {
			chanceAction(chanceIndex);
		});

		cartaCance.index++;

		if (cartaCance.index >= cartaCance.deck.length) {
			cartaCance.index = 0;
		}
	} else {
		if (!p.human) {
			p.AI.alertList = "";

			if (!p.AI.onLand()) {
				game.next();
			}
		}
	}
}

function chanceAction(chanceIndex) {
	var p = player[turn]; // Necessário para referenciar o método de leilao

	cartaCance[chanceIndex].action(p);

	updateMoney();

	if (chanceIndex !== 15 && !p.human) {
		p.AI.alertList = "";
		game.next();
	}
}

function communityChestAction(communityChestIndex) {
	var p = player[turn]; // Necessário para referenciar o método de leilao

	// $('#popupbackground').hide();
	// $('#popupwrap').hide();
	cartaBauDaComunidade[communityChestIndex].action(p);

	updateMoney();

	if (communityChestIndex !== 15 && !p.human) {
		p.AI.alertList = "";
		game.next();
	}
}

function addamount(amount, cause) {
	var p = player[turn];

	p.money += amount;

	addAlert(p.name + " recebeu R$" + amount + " de " + cause + ".");
}

function subtractamount(amount, cause) {
	var p = player[turn];

	p.pay(amount, 0);

	addAlert(p.name + " perdeu $" + amount + " de " + cause + ".");
}

function gotojail() {
	var p = player[turn];
	addAlert(p.name + " foi enviado direto para cadeia.");
	document.getElementById("landed").innerHTML = "You are in jail.";

	p.jail = true;
	doublecount = 0;

	document.getElementById("nextbutton").value = "Finalizar vez ";
	document.getElementById("nextbutton").title = "Finalizar a vez e passar para o próximo jogador";

	if (p.human) {
		document.getElementById("nextbutton").focus();
	}

	updatePosition();
	updateOwned();

	if (!p.human) {
		popup(p.AI.alertList, game.next);
		p.AI.alertList = "";
	}
}

function gobackthreespaces() {
	var p = player[turn];

	p.position -= 3;

	land();
}

function payeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	for (var i = 1; i <= pcount; i++) {
		if (i != turn) {
			player[i].money += amount;
			total += amount;
			creditor = p.money >= 0 ? i : creditor;

			p.pay(amount, creditor);
		}
	}

	addAlert(p.name + " perdeu $" + total + " de " + cause + ".");
}

function collectfromeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	for (var i = 1; i <= pcount; i++) {
		if (i != turn) {
			money = player[i].money;
			if (money < amount) {
				p.money += money;
				total += money;
				player[i].money = 0;
			} else {
				player[i].pay(amount, turn);
				p.money += amount;
				total += amount;
			}
		}
	}

	addAlert(p.name + " recebeu R$" + total + " de " + cause + ".");
}

function advance(destination, pass) {
	var p = player[turn];

	if (typeof pass === "number") {
		if (p.position < pass) {
			p.position = pass;
		} else {
			p.position = pass;
			p.money += 200;
			addAlert(p.name + " recebeu R$200 de salário por passar na PARTIDA.");
		}
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
		p.money += 200;
		addAlert(p.name + " recebeu R$200 de salário por passar na PARTIDA.");
	}

	land();
}

function advanceToNearestUtility() {
	var p = player[turn];

	if (p.position < 12) {
		p.position = 12;
	} else if (p.position >= 12 && p.position < 28) {
		p.position = 28;
	} else if (p.position >= 28) {
		p.position = 12;
		p.money += 200;
		addAlert(p.name + " recebeu R$200 de salário por passar na PARTIDA.");
	}

	land(true);
}

function advanceToNearestRailroad() {
	var p = player[turn];

	updatePosition();

	if (p.position < 15) {
		p.position = 15;
	} else if (p.position >= 15 && p.position < 25) {
		p.position = 25;
	} else if (p.position >= 35) {
		p.position = 5;
		p.money += 200;
		addAlert(p.name + " recebeu a R$200 de salário por passar na PARTIDA.");
	}

	land(true);
}

function streetrepairs(houseprice, hotelprice) {
	var cost = 0;
	for (var i = 0; i < 40; i++) {
		var s = quadro[i];
		if (s.owner == turn) {
			if (s.hotel == 1)
				cost += hotelprice;
			else
				cost += s.house * houseprice;
		}
	}

	var p = player[turn];

	if (cost > 0) {
		p.pay(cost, 0);

		if (houseprice === 40) {
			addAlert(p.name + " lost $" + cost + " to Baú da Comunidade.");
		} else {
			addAlert(p.name + " lost $" + cost + " to Chance.");
		}
	}

}

function payfifty() {
	var p = player[turn];

	document.getElementById("jail").style.border = '1px solid black';
	document.getElementById("cell11").style.border = '2px solid ' + p.color;

	$("#landed").hide();
	doublecount = 0;

	p.jail = false;
	p.jailroll = 0;
	p.position = 10;
	p.pay(50, 0);

	addAlert(p.name + " pagou a multa de RS $ 50 para sair da prisão.");
	updateMoney();
	updatePosition();
}

function useJailCard() {
	var p = player[turn];

	document.getElementById("jail").style.border = '1px solid black';
	document.getElementById("cell11").style.border = '2px solid ' + p.color;

	$("#landed").hide();
	p.jail = false;
	p.jailroll = 0;

	p.position = 10;

	doublecount = 0;

	if (p.communityChestJailCard) {
		p.communityChestJailCard = false;


		cartaBauDaComunidade.deck.splice(cartaBauDaComunidade.index, 0, 0);

		cartaBauDaComunidade.index++;

		if (cartaBauDaComunidade.index >= cartaBauDaComunidade.deck.length) {
			cartaBauDaComunidade.index = 0;
		}
	} else if (p.chanceJailCard) {
		p.chanceJailCard = false;
		
		cartaCance.deck.splice(cartaCance.index, 0, 0);

		cartaCance.index++;

		if (cartaCance.index >= cartaCance.deck.length) {
			cartaCance.index = 0;
		}
	}

	addAlert(p.name + " used a \"Cartão Para Saída da Cadeia De Graça\" card.");
	updateOwned();
	updatePosition();
}

function buyHouse(index) {
	var sq = quadro[index];
	var p = player[sq.owner];
	var houseSum = 0;
	var hotelSum = 0;

	if (p.money - sq.houseprice < 0) {
		if (sq.house == 4) {
			return false;
		} else {
			return false;
		}

	} else {
		for (var i = 0; i < 40; i++) {
			if (quadro[i].hotel === 1) {
				hotelSum++;
			} else {
				houseSum += quadro[i].house;
			}
		}

		if (sq.house < 4) {
			if (houseSum >= 32) {
				return false;

			} else {
				sq.house++;
				addAlert(p.name + " construiu uma casa em " + sq.name + ".");
			}

		} else {
			if (hotelSum >= 12) {
				return;

			} else {
				sq.house = 5;
				sq.hotel = 1;
				addAlert(p.name + " construiu um hotel em " + sq.name + ".");
			}
		}

		p.pay(sq.houseprice, 0);

		updateOwned();
		updateMoney();
	}
}

function sellHouse(index) {
	sq = quadro[index];
	p = player[sq.owner];

	if (sq.hotel === 1) {
		sq.hotel = 0;
		sq.house = 4;
		addAlert(p.name + " vendeu o hotel em " + sq.name + ".");
	} else {
		sq.house--;
		addAlert(p.name + " vendeu o hotel em " + sq.name + ".");
	}

	p.money += sq.houseprice * 0.5;
	updateOwned();
	updateMoney();
}

function showStats() {
	var HTML, sq, p;
	var mortgagetext,
	housetext;
	var write;
	HTML = "<table align='center'><tr>";

	for (var x = 1; x <= pcount; x++) {
		write = false;
		p = player[x];
		if (x == 5) {
			HTML += "</tr><tr>";
		}
		HTML += "<td class='statscell' id='statscell" + x + "' style='border: 2px solid " + p.color + "' ><div class='statsplayername'>" + p.name + "</div>";

		for (var i = 0; i < 40; i++) {
			sq = quadro[i];

			if (sq.owner == x) {
				mortgagetext = "",
				housetext = "";

				if (sq.mortgage) {
					mortgagetext = "title='Mortgaged' style='color: grey;'";
				}

				if (!write) {
					write = true;
					HTML += "<table>";
				}

				if (sq.house == 5) {
					housetext += "<span style='float: right; font-weight: bold;'>1&nbsp;x&nbsp;<img src='img/hotel.png' alt='' title='Hotel' class='hotel' style='float: none;' /></span>";
				} else if (sq.house > 0 && sq.house < 5) {
					housetext += "<span style='float: right; font-weight: bold;'>" + sq.house + "&nbsp;x&nbsp;<img src='img/house.png' alt='' title='House' class='house' style='float: none;' /></span>";
				}

				HTML += "<tr><td class='statscellcolor' style='background: " + sq.color + ";";

				if (sq.groupNumber == 1 || sq.groupNumber == 2) {
					HTML += " border: 1px solid grey;";
				}

				HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='statscellname' " + mortgagetext + ">" + sq.name + housetext + "</td></tr>";
			}
		}

		if (p.communityChestJailCard) {
			if (!write) {
				write = true;
				HTML += "<table>";
			}
			HTML += "<tr><td class='statscellcolor'></td><td class='statscellname'>Cartão de saída da cadeia de graça</td></tr>";

		}
		if (p.chanceJailCard) {
			if (!write) {
				write = true;
				HTML += "<table>";
			}
			HTML += "<tr><td class='statscellcolor'></td><td class='statscellname'>Cartão de saída da cadeia de graça</td></tr>";

		}

		if (!write) {
			HTML += p.name + " não possui nenhuma propriedade.";
		} else {
			HTML += "</table>";
		}

		HTML += "</td>";
	}
	HTML += "</tr></table><div id='titledeed'></div>";

	document.getElementById("statstext").innerHTML = HTML;
	// Show using animation.
	$("#statsbackground").fadeIn(400, function() {
		$("#statswrap").show();
	});
}

function showdeed(property) {
	var sq = quadro[property];
	$("#deed").show();

	$("#deed-normal").hide();
	$("#deed-mortgaged").hide();
	$("#deed-special").hide();

	if (sq.mortgage) {
		$("#deed-mortgaged").show();
		document.getElementById("deed-mortgaged-name").textContent = sq.name;
		document.getElementById("deed-mortgaged-mortgage").textContent = (sq.price / 2);

	} else {

		if (sq.groupNumber >= 3) {
			$("#deed-normal").show();
			document.getElementById("deed-header").style.backgroundColor = sq.color;
			document.getElementById("deed-name").textContent = sq.name;
			document.getElementById("deed-baserent").textContent = sq.baserent;
			document.getElementById("deed-rent1").textContent = sq.rent1;
			document.getElementById("deed-rent2").textContent = sq.rent2;
			document.getElementById("deed-rent3").textContent = sq.rent3;
			document.getElementById("deed-rent4").textContent = sq.rent4;
			document.getElementById("deed-rent5").textContent = sq.rent5;
			document.getElementById("deed-mortgage").textContent = (sq.price / 2);
			document.getElementById("deed-houseprice").textContent = sq.houseprice;
			document.getElementById("deed-hotelprice").textContent = sq.houseprice;

		} else if (sq.groupNumber == 2) {
			$("#deed-special").show();
			document.getElementById("deed-special-name").textContent = sq.name;
			document.getElementById("deed-special-text").innerHTML = utiltext();
			document.getElementById("deed-special-mortgage").textContent = (sq.price / 2);

		} else if (sq.groupNumber == 1) {
			$("#deed-special").show();
			document.getElementById("deed-special-name").textContent = sq.name;
			document.getElementById("deed-special-text").innerHTML = transtext();
			document.getElementById("deed-special-mortgage").textContent = (sq.price / 2);
		}
	}
}

function hidedeed() {
	$("#deed").hide();
}

function buy() {
	var p = player[turn];
	var property = quadro[p.position];
	var cost = property.price;

	if (p.money >= cost) {
		p.pay(cost, 0);

		property.owner = turn;
		updateMoney();
		addAlert(p.name + " comprou " + property.name + " por " + property.pricetext + ".");

		updateOwned();

		$("#landed").hide();

	} else {
		popup("<p>" + p.name + ", você precisa de  R$" + (property.price - p.money) + " a mais para comprar " + property.name + ".</p>");
	}
}

function mortgage(index) {
	var sq = quadro[index];
	var p = player[sq.owner];

	if (sq.house > 0 || sq.hotel > 0 || sq.mortgage) {
		return false;
	}

	var mortgagePrice = Math.round(sq.price * 0.5);
	var unmortgagePrice = Math.round(sq.price * 0.55);

	sq.mortgage = true;
	p.money += mortgagePrice;

	document.getElementById("mortgagebutton").value = "Unmortgage for $" + unmortgagePrice;
	document.getElementById("mortgagebutton").title = "Unmortgage " + sq.name + " for $" + unmortgagePrice + ".";

	addAlert(p.name + " mortgaged " + sq.name + " for $" + mortgagePrice + ".");
	updateOwned();
	updateMoney();

	return true;
}

function unmortgage(index) {
	var sq = quadro[index];
	var p = player[sq.owner];
	var unmortgagePrice = Math.round(sq.price * 0.55);
	var mortgagePrice = Math.round(sq.price * 0.5);

	if (unmortgagePrice > p.money || !sq.mortgage) {
		return false;
	}

	p.pay(unmortgagePrice, 0);
	sq.mortgage = false;
	document.getElementById("mortgagebutton").value = "Mortgage for $" + mortgagePrice;
	document.getElementById("mortgagebutton").title = "Mortgage " + sq.name + " for $" + mortgagePrice + ".";

	addAlert(p.name + " unmortgaged " + sq.name + " for $" + unmortgagePrice + ".");
	updateOwned();
	return true;
}


function land(increasedRent) {
	increasedRent = !!increasedRent; 

	var p = player[turn];
	var s = quadro[p.position];

	var die1 = game.getDie(1);
	var die2 = game.getDie(2);

	$("#landed").show();
	document.getElementById("landed").innerHTML = "Você caiu em " + s.name + ".";
	s.landcount++;
	addAlert(p.name + " caiu em " + s.name + ".");

	// Permite o jogador comprar a propriedade que ele caiu
	if (s.price !== 0 && s.owner === 0) {

		if (!p.human) {

			if (p.AI.buyProperty(p.position)) {
				buy();
			}
		} else {
			document.getElementById("landed").innerHTML = "<div>Você caiu em <a href='javascript:void(0);' onmouseover='showdeed(" + p.position + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a>.<input type='button' onclick='buy();' value='Comprar (R$" + s.price + ")' title='Comprar " + s.name + " por " + s.pricetext + ".' class='btn btn-primary btn-sm'/></div>";
		}


		game.addPropertyToAuctionQueue(p.position);
	}

	// Collect rent
	if (s.owner !== 0 && s.owner != turn && !s.mortgage) {
		var groupowned = true;
		var rent;

		// Railroads
		if (p.position == 5 || p.position == 15 || p.position == 25 || p.position == 35) {
			if (increasedRent) {
				rent = 25;
			} else {
				rent = 12.5;
			}

			if (s.owner == quadro[5].owner) {
				rent *= 2;
			}
			if (s.owner == quadro[15].owner) {
				rent *= 2;
			}
			if (s.owner == quadro[25].owner) {
				rent *= 2;
			}
			if (s.owner == quadro[35].owner) {
				rent *= 2;
			}

		} else if (p.position === 12) {
			if (increasedRent || quadro[28].owner == s.owner) {
				rent = (die1 + die2) * 10;
			} else {
				rent = (die1 + die2) * 4;
			}

		} else if (p.position === 28) {
			if (increasedRent || quadro[12].owner == s.owner) {
				rent = (die1 + die2) * 10;
			} else {
				rent = (die1 + die2) * 4;
			}

		} else {

			for (var i = 0; i < 40; i++) {
				sq = quadro[i];
				if (sq.groupNumber == s.groupNumber && sq.owner != s.owner) {
					groupowned = false;
				}
			}

			if (!groupowned) {
				rent = s.baserent;
			} else {
				if (s.house === 0) {
					rent = s.baserent * 2;
				} else {
					rent = s["rent" + s.house];
				}
			}
		}

		addAlert(p.name + " pagou R$" + rent + " de aluguel para " + player[s.owner].name + ".");
		p.pay(rent, s.owner);
		player[s.owner].money += rent;

		document.getElementById("landed").innerHTML = "Você caiu em " + s.name + ". " + player[s.owner].name + " recebeu R$" + rent + " de aluguel.";
	} else if (s.owner > 0 && s.owner != turn && s.mortgage) {
		document.getElementById("landed").innerHTML = "Você caiu em " + s.name + ". Propriedade hipotecada, alguel recolhido.";
	}

	// Imposto municipal
	if (p.position === 4) {
		citytax();
	}

	// Vá para cadeia direto. Não passe pela PARTIDA e não receba R$ 200
	if (p.position === 30) {
		updateMoney();
		updatePosition();

		if (p.human) {
			popup("<div>Vá para cadeia direto. Não passe pela PARTIDA e não receba R$ 200.</div>", gotojail);
		} else {
			gotojail();
		}

		return;
	}

	// Luxury Tax
	if (p.position === 38) {
		luxurytax();
	}

	updateMoney();
	updatePosition();
	updateOwned();

	if (!p.human) {
		popup(p.AI.alertList, chanceCommunityChest);
		p.AI.alertList = "";
	} else {
		chanceCommunityChest();
	}
}

function roll() {
	var p = player[turn];

	$("#option").hide();
	$("#buy").show();
	$("#manage").hide();

	if (p.human) {
		document.getElementById("nextbutton").focus();
	}
	document.getElementById("nextbutton").value = "Finaliza vez";
	document.getElementById("nextbutton").title = "Finaliza a vez e passa para o próximo jogador.";

	game.rollDice();
	var die1 = game.getDie(1);
	var die2 = game.getDie(2);

	doublecount++;

	if (die1 == die2) {
		addAlert(p.name + " jogou " + (die1 + die2) + " - iguais.");
	} else {
		addAlert(p.name + " jogou " + (die1 + die2) + ".");
	}

	if (die1 == die2 && !p.jail) {
		updateDice(die1, die2);

		if (doublecount < 3) {
			document.getElementById("nextbutton").value = "Jogar de novo";
			document.getElementById("nextbutton").title = "Você tirou números iguais, jogue novamente.";

		// Se o jogador tirar iguais 3x, vai para cadeia. (Ladrão safado)
		} else if (doublecount === 3) {
			p.jail = true;
			doublecount = 0;
			addAlert(p.name + " jogou iguais 3 vezes nessa rodada.");
			updateMoney();

			if (p.human) {
				popup("Você jogou três vezes iguais na mesma rodada. Vá para cadeia.", gotojail);
			} else {
				gotojail();
			}

			return;
		}
	} else {
		document.getElementById("nextbutton").value = "Finalizar vez";
		document.getElementById("nextbutton").title = "Finaliza a vez e passa para o próximo.";
		doublecount = 0;
	}

	updatePosition();
	updateMoney();
	updateOwned();

	if (p.jail === true) {
		p.jailroll++;

		updateDice(die1, die2);
		if (die1 == die2) {
			document.getElementById("jail").style.border = "1px solid black";
			document.getElementById("cell11").style.border = "2px solid " + p.color;
			$("#landed").hide();

			p.jail = false;
			p.jailroll = 0;
			p.position = 10 + die1 + die2;
			doublecount = 0;

			addAlert(p.name + " acertou dois iguais, saia da cadeia.");

			land();
		} else {
			if (p.jailroll === 3) {

				if (p.human) {
					popup("<p>Você deve pagar R$ 50 de multa.</p>", function() {
						payfifty();
						player[turn].position=10 + die1 + die2;
						land();
					});
				} else {
					payfifty();
					p.position = 10 + die1 + die2;
					land();
				}
			} else {
				$("#landed").show();
			document.getElementById("landed").innerHTML = "Você está na cadeia.";

				if (!p.human) {
					popup(p.AI.alertList, game.next);
					p.AI.alertList = "";
				}
			}
		}


	} else {
		updateDice(die1, die2);

		// Move o jogador
		p.position += die1 + die2;

		// Receba  R$200 de salario por passar pela PARTIDA
		if (p.position >= 40) {
			p.position -= 40;
			p.money += 200;
			addAlert(p.name + " recebeu um salario de R$200  por passar na PARTIDA.");
		}

		land();
	}
}

function play() {
	if (game.auction()) {
		return;
	}

	turn++;
	if (turn > pcount) {
		turn -= pcount;
	}

	var p = player[turn];
	game.resetDice();

	document.getElementById("pname").innerHTML = p.name;

	addAlert(`É a vez de ${p.name}.`);

	// Check for bankruptcy.
	p.pay(0, p.creditor);

	$("#landed, #option, #manage").hide();
	$("#board, #control, #moneybar, #viewstats, #buy").show();

	doublecount = 0;
	if (p.human) {
		document.getElementById("nextbutton").focus();
	}
	document.getElementById("nextbutton").value = "Jogar os dados";
	document.getElementById("nextbutton").title = "Jogue os dados para que seu personagem ande no tabuleiro.";

	$("#die0").hide();
	$("#die1").hide();

	if (p.jail) {
		$("#landed").show();
		document.getElementById("landed").innerHTML = "Você está na cadeia.<input type='button' title='Pague R$50 de mula e sai da cadeia agora.' value='Pague R$ 50 de multa' onclick='payfifty();' class='btn btn-primary btn-sm' />";

		if (p.communityChestJailCard || p.chanceJailCard) {
			document.getElementById("landed").innerHTML += "<input type='button' id='gojfbutton' title='Use &quot;Get Out of Jail Free&quot; card.' onclick='useJailCard();' value='Use Card' class='btn btn-primary btn-sm' />";
		}

		document.getElementById("nextbutton").title = "Joga os dados. Se você acertar dados iguais, você sairá da cadeia.";

		if (p.jailroll === 0)
			addAlert("This is " + p.name + "'s first turn in jail.");
		else if (p.jailroll === 1)
			addAlert("This is " + p.name + "'s second turn in jail.");
		else if (p.jailroll === 2) {
			document.getElementById("landed").innerHTML += "<div>OBS: Se você não acerta dados iguais depois dessa jogada, você <i>deverá</i> pagar R$50 de multa.</div>";
			addAlert("This is " + p.name + "'s third turn in jail.");
		}

		if (!p.human && p.AI.postBail()) {
			if (p.communityChestJailCard || p.chanceJailCard) {
				useJailCard();
			} else {
				payfifty();
			}
		}
	}

	updateMoney();
	updatePosition();
	updateOwned();

	$(".money-bar-arrow").hide();
	$("#p" + turn + "arrow").show();

	if (!p.human) {
		if (!p.AI.beforeTurn()) {
			game.next();
		}
	}
}

function setup() {
	document.querySelector("body").classList.add("jogo-iniciado");
	pcount = parseInt(document.getElementById("playernumber").value, 10);

	var playerArray = new Array(pcount);
	var p;

	playerArray.randomize();

	for (var i = 1; i <= pcount; i++) {
		p = player[playerArray[i - 1]];


		p.color = document.getElementById("player" + i + "color").value.toLowerCase();

		if (document.getElementById("player" + i + "ai").value === "0") {
			p.name = document.getElementById("player" + i + "name").value;
			p.human = true;
		} else if (document.getElementById("player" + i + "ai").value === "1") {
			p.human = false;
			p.AI = new IA(p);
		}
	}

	$("#board, #moneybar").show();
	$("#setup").hide();

	if (pcount === 2) {
		document.getElementById("stats").style.width = "454px";
	} else if (pcount === 3) {
		document.getElementById("stats").style.width = "686px";
	}

	document.getElementById("stats").style.top = "0px";
	document.getElementById("stats").style.left = "0px";

	play();
}

function getCheckedProperty() {
	for (var i = 0; i < 42; i++) {
		if (document.getElementById("propertycheckbox" + i) && document.getElementById("propertycheckbox" + i).checked) {
			return i;
		}
	}
	return -1; // Nenhuma propriedade está marcada
}

function playernumber_onchange() {
	pcount = parseInt(document.getElementById("playernumber").value, 10);

	$(".player-input").hide();

	for (var i = 1; i <= pcount; i++) {
		$("#player" + i + "input").show();
	}
}

function menuitem_onmouseover(element) {
	element.className = "menuitem menuitem_hover";
	return;
}

function menuitem_onmouseout(element) {
	element.className = "menuitem";
	return;
}

window.onload = function() {
	game = new Game();

	for (var i = 0; i <= 8; i++) {
		player[i] = new Player("", "");
		player[i].index = i;
	}

	var groupPropertyArray = [];
	var groupNumber;

	for (var i = 0; i < 40; i++) {
		groupNumber = quadro[i].groupNumber;

		if (groupNumber > 0) {
			if (!groupPropertyArray[groupNumber]) {
				groupPropertyArray[groupNumber] = [];
			}

			groupPropertyArray[groupNumber].push(i);
		}
	}

	for (var i = 0; i < 40; i++) {
		groupNumber = quadro[i].groupNumber;

		if (groupNumber > 0) {
			quadro[i].group = groupPropertyArray[groupNumber];
		}

		quadro[i].index = i;
	}

	IA.count = 0;

	player[1].human = true;
	player[0].name = "the bank";

	cartaBauDaComunidade.index = 0;
	cartaCance.index = 0;

	cartaBauDaComunidade.deck = [];
	cartaCance.deck = [];

	for (var i = 0; i < 16; i++) {
		cartaCance.deck[i] = i;
		cartaBauDaComunidade.deck[i] = i;
	}

	// Embaralha as Chance e Baú da Comunidade.
	cartaCance.deck.sort(function() {return Math.random() - 0.5;});
	cartaBauDaComunidade.deck.sort(function() {return Math.random() - 0.5;});

	$("#playernumber").on("change", playernumber_onchange);
	playernumber_onchange();

	$("#nextbutton").click(game.next);
	$("#noscript").hide();
	$("#setup, #noF5").show();

	var enlargeWrap = document.body.appendChild(document.createElement("div"));

	enlargeWrap.id = "enlarge-wrap";

	var HTML = "";
	for (var i = 0; i < 40; i++) {
		HTML += "<div id='enlarge" + i + "' class='enlarge'>";
		HTML += "<div id='enlarge" + i + "color' class='enlarge-color'></div><div id='enlarge" + i + "name' class='enlarge-name'></div>";
		HTML += "<div id='enlarge" + i + "price' class='enlarge-price'></div>";
		HTML += "<div id='enlarge" + i + "token' class='enlarge-token'></div></div>";
	}

	enlargeWrap.innerHTML = HTML;

	var currentCell;
	var currentCellAnchor;
	var currentCellPositionHolder;
	var currentCellName;
	var currentCellOwner;

	for (var i = 0; i < 40; i++) {
		s = quadro[i];

		currentCell = document.getElementById("cell" + i);

		currentCellAnchor = currentCell.appendChild(document.createElement("div"));
		currentCellAnchor.id = "cell" + i + "anchor";
		currentCellAnchor.className = "cell-anchor";

		currentCellPositionHolder = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellPositionHolder.id = "cell" + i + "positionholder";
		currentCellPositionHolder.className = "cell-position-holder";
		currentCellPositionHolder.enlargeId = "enlarge" + i;

		currentCellName = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellName.id = "cell" + i + "name";
		currentCellName.className = "cell-name";
		currentCellName.textContent = s.name;

		if (quadro[i].groupNumber) {
			currentCellOwner = currentCellAnchor.appendChild(document.createElement("div"));
			currentCellOwner.id = "cell" + i + "owner";
			currentCellOwner.className = "cell-owner";
		}

		document.getElementById("enlarge" + i + "color").style.backgroundColor = s.color;
		document.getElementById("enlarge" + i + "name").textContent = s.name;
		document.getElementById("enlarge" + i + "price").textContent = s.pricetext;
	}


	// Adiciona imagens 
	document.getElementById("enlarge0token").innerHTML += '<img src="img/arrow_icon.png" height="40" width="136" alt="" />';
	document.getElementById("enlarge20price").innerHTML += "<img src='img/free_parking_icon.png' height='80' width='72' alt='' style='position: relative; top: -20px;' />";
	document.getElementById("enlarge38token").innerHTML += '<img src="img/tax_icon.png" height="60" width="70" alt="" style="position: relative; top: -20px;" />';

	corrections();

	// Correções da cadeia
	$("<div>", {id: "jailpositionholder" }).appendTo("#jail");
	$("<span>").text("Cadeia").appendTo("#jail");

	document.getElementById("jail").enlargeId = "enlarge40";

	document.getElementById("enlarge-wrap").innerHTML += "<div id='enlarge40' class='enlarge'><div id='enlarge40color' class='enlarge-color'></div><br /><div id='enlarge40name' class='enlarge-name'>Jail</div><br /><div id='enlarge40price' class='enlarge-price'><img src='img/jake_icon.png' height='80' width='80' alt='' style='position: relative; top: -20px;' /></div><br /><div id='enlarge40token' class='enlarge-token'></div></div>";

	document.getElementById("enlarge40name").innerHTML = "Cadeia";


	var drag, dragX, dragY, dragObj, dragTop, dragLeft;

	$(".cell-position-holder, #jail").on("mouseover", function(){
		$("#" + this.enlargeId).addClass("showFlex");

	}).on("mouseout", function() {
		$("#" + this.enlargeId).removeClass("showFlex");

	}).on("mousemove", function(e) {
		var element = document.getElementById(this.enlargeId);

		if (e.clientY + 20 > window.innerHeight - 204) {
			element.style.top = (window.innerHeight - 204) + "px";
		} else {
			element.style.top = (e.clientY + 20) + "px";
		}

		element.style.left = (e.clientX + 10) + "px";
	});


	$("body").on("mousemove", function(e) {
		var object;

		if (e.target) {
			object = e.target;
		} else if (window.event && window.event.srcElement) {
			object = window.event.srcElement;
		}


		if (object.classList.contains("propertycellcolor") || object.classList.contains("statscellcolor")) {
			if (e.clientY + 20 > window.innerHeight - 279) {
				document.getElementById("deed").style.top = (window.innerHeight - 279) + "px";
			} else {
				document.getElementById("deed").style.top = (e.clientY + 20) + "px";
			}
			document.getElementById("deed").style.left = (e.clientX + 10) + "px";


		} else if (drag) {
			if (e) {
				dragObj.style.left = (dragLeft + e.clientX - dragX) + "px";
				dragObj.style.top = (dragTop + e.clientY - dragY) + "px";

			} else if (window.event) {
				dragObj.style.left = (dragLeft + window.event.clientX - dragX) + "px";
				dragObj.style.top = (dragTop + window.event.clientY - dragY) + "px";
			}
		}
	});


	$("body").on("mouseup", function() {

		drag = false;
	});
	document.getElementById("statsdrag").onmousedown = function(e) {
		dragObj = document.getElementById("stats");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	document.getElementById("popupdrag").onmousedown = function(e) {
		dragObj = document.getElementById("popup");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	$("#mortgagebutton").click(function() {
		var checkedProperty = getCheckedProperty();
		var s = quadro[checkedProperty];

		if (s.mortgage) {
			if (player[s.owner].money < Math.round(s.price * 0.55)) {
				popup("<p>Você precisa de R$" + (Math.round(s.price * 0.55) - player[s.owner].money) + " a mais para deshipotecar " + s.name + ".</p>");

			} else {
				popup("<p>" + player[s.owner].name + ", tem certeza que deseja deshipotecar " + s.name + " por R$" + Math.round(s.price * 0.55) + "?</p>", function() {
					unmortgage(checkedProperty);
				}, "Sim/Não");
			}
		} else {
			popup("<p>" + player[s.owner].name + ", tem certeza que deseja hipotecar " + s.name + " por R$" + Math.round(s.price * 0.5) + "?</p>", function() {
				mortgage(checkedProperty);
			}, "Sim/Não");
		}

	});

	$("#buyhousebutton").on("click", function() {
		var checkedProperty = getCheckedProperty();
		var s = quadro[checkedProperty];
		var p = player[s.owner];
		var houseSum = 0;
		var hotelSum = 0;

		if (p.money < s.houseprice) {
			if (s.house === 4) {
				popup("<p>Você precisa de R$" + (s.houseprice - player[s.owner].money) + " a mais para comprar o hotel " + s.name + ".</p>");
				return;
			} else {
				popup("<p>Você precisa de R$" + (s.houseprice - player[s.owner].money) + " a mais para comprar o hote " + s.name + ".</p>");
				return;
			}
		}

		for (var i = 0; i < 40; i++) {
			if (quadro[i].hotel === 1) {
				hotelSum++;
			} else {
				houseSum += quadro[i].house;
			}
		}

		if (s.house < 4 && houseSum >= 32) {
			popup("<p>All 32 houses are owned. You must wait until one becomes available.</p>");
			return;
		} else if (s.house === 4 && hotelSum >= 12) {
			popup("<p>All 12 hotels are owned. You must wait until one becomes available.</p>");
			return;
		}

		buyHouse(checkedProperty);

	});

	$("#sellhousebutton").click(function() { sellHouse(getCheckedProperty()); });

	$("#viewstats").on("click", showStats);
	$("#statsclose, #statsbackground").on("click", function() {
		$("#statswrap").hide();
		$("#statsbackground").fadeOut(400);
	});

	$("#buy-menu-item").click(function() {
		$("#buy").show();
		$("#manage").hide();

		// Joga os alertas para o rodapé
		$("#alert").scrollTop($("#alert").prop("scrollHeight"));
	});


	$("#manage-menu-item").click(function() {
		$("#manage").show();
		$("#buy").hide();
	});


	$("#trade-menu-item").click(game.trade);


};
