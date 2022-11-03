function Quadro(name, pricetext, color, price, groupNumber, baserent, rent1, rent2, rent3, rent4, rent5) {
	this.name = name;
	this.pricetext = pricetext;
	this.color = color;
	this.owner = 0;
	this.mortgage = false;
	this.house = 0;
	this.hotel = 0;
	this.groupNumber = groupNumber || 0;
	this.price = (price || 0);
	this.baserent = (baserent || 0);
	this.rent1 = (rent1 || 0);
	this.rent2 = (rent2 || 0);
	this.rent3 = (rent3 || 0);
	this.rent4 = (rent4 || 0);
	this.rent5 = (rent5 || 0);
	this.landcount = 0;

	if (groupNumber === 3 || groupNumber === 4) {
		this.houseprice = 50;
	} else if (groupNumber === 5 || groupNumber === 6) {
		this.houseprice = 100;
	} else if (groupNumber === 7 || groupNumber === 8) {
		this.houseprice = 150;
	} else if (groupNumber === 9 || groupNumber === 10) {
		this.houseprice = 200;
	} else {
		this.houseprice = 0;
	}
}

function Cartao(text, action) {
	this.text = text;
	this.action = action;
}

function corrections() {
	document.getElementById("cell24name").textContent = "properando...";
}

function utiltext() {
	return '&nbsp;&nbsp;&nbsp;&nbsp;Se um "utilitário" for de propriedade, o aluguel é 4 vezes o valor mostrado nos dados.<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;Se ambos os "Utilitários" forem de propriedade, o aluguel é 10 vezes o valor mostrado nos dados.';
}

function transtext() {
	return '<div style="font-size: 14px; line-height: 1.5;">Aluguel<span style="float: right;">R$25.</span><br />Se 2 transportes são de propriedade<span style="float: right;">50.</span><br />Se 3 &nbsp; &nbsp; " &nbsp; &nbsp; " &nbsp; &nbsp; "<span style="float: right;">100.</span><br />Se 4 &nbsp; &nbsp; " &nbsp; &nbsp; " &nbsp; &nbsp; "<span style="float: right;">200.</span></div>';
}

function citytax() {
	var p = player[turn];

	if (p.human) {

		buttonAonclick = 'hide("popupbackground"); hide("popupwrap"); var p=player[turn]; addalert(p.name+" pagou R$ 200 por parar no Imposto Municipal."); p.pay(200, 0);';
		buttonBonclick = ' hide("popupbackground"); hide("popupwrap"); var p=player[turn]; var cost=p.money; for(var i=0; i<40; i++){sq=quadro[i]; if(sq.owner==turn) { if(sq.mortgage) { cost+=sq.price*0.5; } else { cost+=sq.price; } cost+=(sq.house*sq.houseprice); } } cost*=0.1; cost=Math.round(cost); addalert(p.name+" paid $"+cost+" por para no Imposto Municipal."); p.pay(cost,0);';

		popup("Você parou em 'Importo Municipal'. Você tem que pagar R$ 200 ou 10% do valor total.<div><input type='button' value='Pagar R$200' onclick='" + buttonAonclick + "' /><input type='button' value='Pagar 10%' onclick='" + buttonBonclick + "' /></div>", false);
	} else {
		addalert(p.name + " pagou R$ 200 por parar em 'Imposto Municipal'.");
		p.pay(200, 0);
	}
}

function luxurytax() {
	addalert(player[turn].name + " pagou R$ 75 por parar em 'Imposto de Luxo'.");
	player[turn].pay(75, 0);

	$("landed").show().text("Você parou em 'Imposto de Luxo'. Pague R$ 75.");
}

var quadro = [];

quadro[0] = new Quadro("Partida", "RECOLHA R$200 DE SALÁRIO AO PASSAR POR AQUI.", "white");
quadro[1] = new Quadro("Companhia de Docas do Rio de Janeiro", "R$ 60", "#4B0082", 60, 3, 2, 10, 30, 90, 160, 250);
quadro[2] = new Quadro("Baú da Comunidade", "SIGA AS INSTRUÇÕES DA PRÓXIMA CARTA", "white");
quadro[3] = new Quadro("Tunel Rebouças", "R$ 60", "#4B0082", 60, 3, 4, 20, 60, 180, 320, 450);
quadro[4] = new Quadro("Imposto Municipal", "PAGUE 10% OU R$ 200", "white");
quadro[5] = new Quadro("Sociedade dos Propritários de Taxis", "R$ 200", "white", 200, 1);
quadro[6] = new Quadro("Cristo Redentor", "R$ 100", "#AACCFF", 100, 4, 6, 30, 90, 270, 400, 550);
quadro[7] = new Quadro("Chance", "LOTÉRICA DO RIO DE JANEIRO", "white");
quadro[8] = new Quadro("Rio Sul Center", "R$ 100", "#AACCFF", 100, 4, 6, 30, 90, 270, 400, 550);
quadro[9] = new Quadro("Campo de Santana", "R$ 120", "#AACCFF", 120, 4, 8, 40, 100, 300, 450, 600);
quadro[10] = new Quadro("Só Visita", "", "white");
quadro[11] = new Quadro("100.5 Rádio FM O Dia", "R$ 140", "purple", 140, 5, 10, 50, 150, 450, 625, 750);
quadro[12] = new Quadro("Light SA", "R$ 150", "white", 150, 2);
quadro[13] = new Quadro("Emissora Globo", "R$ 140", "purple", 140, 5, 10, 50, 150, 450, 625, 750);
quadro[14] = new Quadro("Jornal O Globo", "R$ 160", "purple", 160, 5, 12, 60, 180, 500, 700, 900);
quadro[15] = new Quadro("CET- RJ", "R$ 200", "white", 200, 1);
quadro[16] = new Quadro("Flamengo", "R$ 180", "orange", 180, 6, 14, 70, 200, 550, 750, 950);
quadro[17] = new Quadro("Baú da comunidade", "SIGA AS INSTRUÇÕES DA PRÓXIMA CARTA", "white");
quadro[18] = new Quadro("Fluminense", "R$ 180", "orange", 180, 6, 14, 70, 200, 550, 750, 950);
quadro[19] = new Quadro("Parque Olímpico do Rio de Janeiro", "R$ 200", "orange", 200, 6, 16, 80, 220, 600, 800, 1000);
quadro[20] = new Quadro("Estacionamento livre", "", "white");
quadro[21] = new Quadro("Lojas Americanas", "R$ 220", "red", 220, 7, 18, 90, 250, 700, 875, 1050);
quadro[22] = new Quadro("Chance", "LOTÉRICA DO RIO DE JANEIRO", "white");
quadro[23] = new Quadro("Ri Happy Brinquedos", "R$ 220", "red", 220, 7, 18, 90, 250, 700, 875, 1050);
quadro[24] = new Quadro("Magazzine Luiza", "R$ 240", "red", 240, 7, 20, 100, 300, 750, 925, 1100);
quadro[25] = new Quadro("Estação Metro Largo da Carioca", "R$ 200", "white", 200, 1);
quadro[26] = new Quadro("XP Investimentos", "R$ 260", "yellow", 260, 8, 22, 110, 330, 800, 975, 1150);
quadro[27] = new Quadro("NuInvest Rio de Janeiro", "R$ 260", "yellow", 260, 8, 22, 110, 330, 800, 975, 1150);
quadro[28] = new Quadro("Naturgy - Gás Natural do Rio de Janeiro", "R$ 150", "white", 150, 2);
quadro[29] = new Quadro("BTG Pactual", "R$ 280", "yellow", 280, 8, 24, 120, 360, 850, 1025, 1200);
quadro[30] = new Quadro("Vá Para Cadeia", "Vá direto Para Cadeia. Nâo Passe pela Partida. Não Receba R$ 200.", "white");
quadro[31] = new Quadro("Copacana Palace", "R$ 300", "green", 300, 9, 26, 130, 390, 900, 1100, 1275);
quadro[32] = new Quadro("Sheraton Grand Rio Hotel & Resort", "R$ 300", "green", 300, 9, 26, 130, 390, 900, 1100, 1275);
quadro[33] = new Quadro("Baú da Comunidade", "SIGA AS INSTRUÇÕES DA PRÓXIMA CARTA", "white");
quadro[34] = new Quadro("Hilton Rio de Janeiro Copacabana", "R$ 320", "green", 320, 9, 28, 150, 450, 1000, 1200, 1400);
quadro[35] = new Quadro("Petrobras SA", "R$ 200", "white", 200, 1);
quadro[36] = new Quadro("Chance", "LOTÉRICA DO RIO DE JANEIRO", "white");
quadro[37] = new Quadro("Rachel Jóias", "R$ 350", "blue", 350, 10, 35, 175, 500, 1100, 1300, 1500);
quadro[38] = new Quadro("IMPOSTO DE LUXO", "Pague R$ 75", "white");
quadro[39] = new Quadro("Barra Business Center", "R$ 400", "blue", 400, 10, 50, 200, 600, 1400, 1700, 2000);

var cartaBauDaComunidade = [];

cartaBauDaComunidade[0] = new Cartao("Sair da cadeia livre. Este cartão pode ser guardado até ser necessário ou vendido.", function() { p.communityChestJailCard = true; updateOwned();});
cartaBauDaComunidade[1] = new Cartao("Você ganhou a entrega em domicílio vitalícia do Jornal O Globo. Receba R$ 10", function() { addamount(10, 'Baú da Comunidade');});
cartaBauDaComunidade[2] = new Cartao("Com a venda das ações da Petrobras, você ganha R$ 45", function() { addamount(45, 'Baú da Comunidade');});
cartaBauDaComunidade[3] = new Cartao("Seguro de vida vence. Receba $100", function() { addamount(100, 'Baú da Comunidade');});
cartaBauDaComunidade[4] = new Cartao("Lucros do banco BTG. Receba R$ 20", function() { addamount(20, 'Baú da Comunidade');});
cartaBauDaComunidade[5] = new Cartao("FAO Schwarz Xmas fund matures. Collect $100", function() { addamount(100, 'Baú da Comunidade');});
cartaBauDaComunidade[6] = new Cartao("Você ganhou uma viagem pelo mundo da TAM! Receba R$ 100", function() { addamount(100, 'Baú da Comunidade');});
cartaBauDaComunidade[7] = new Cartao("Realizou um casamento Hilton Rio de Janeiro Copacabana. Receb $25", function() { addamount(25, 'Baú da Comunidade');});
cartaBauDaComunidade[8] = new Cartao("Plano de saúde R$ 100", function() { subtractamount(100, 'Baú da Comunidade');});
cartaBauDaComunidade[9] = new Cartao("Você ganhou na loteria! Receba R$ 200", function() { addamount(200, 'Baú da Comunidade');});
cartaBauDaComunidade[10] = new Cartao("Pague a taxa escolar de R$150", function() { subtractamount(150, 'Baú da Comunidade');});
cartaBauDaComunidade[11] = new Cartao("Consulta médica. Pague R$ 50", function() { subtractamount(50, 'Baú da Comunidade');});
cartaBauDaComunidade[12] = new Cartao("Parque Olímpico do Rio de Janeiro está aberto hoje. Receba R$ 50 from every player for opening night seats.", function() { collectfromeachplayer(50, 'Baú da Comunidade');});
cartaBauDaComunidade[13] = new Cartao("Você ganhou um beijo em dinheiro! Avance PARTIDA (Receba R$ 200)", function() { advance(0);});
cartaBauDaComunidade[14] = new Cartao("Você foi escolhido para fazer reparos na rua. R$ 40 por casa. R$115 por hotel.", function() { streetrepairs(40, 115);});
cartaBauDaComunidade[15] = new Cartao("Vá para cadeia. Direto para cadeia. Não passe pela 'Partida'. Não receba R$ 200.", function() { gotojail();});

var cartaCance = [];

cartaCance[0] = new Cartao("Sair da cadeia livre. Este cartão pode ser guardado até ser necessário ou vendido.", function() { p.chanceJailCard=true; updateOwned();});
cartaCance[1] = new Cartao("Reparos gerais em todas as suas propriedades. Para cada casa pague R$ 25. Para cada hotel R$ 100.", function() { streetrepairs(25, 100);});
