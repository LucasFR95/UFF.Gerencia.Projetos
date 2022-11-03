export class dados {
    dadoUm;
    dadoDois; 
    jogouDados;  

    constructor() {        
        this.jogouDados = false;
    }

    rolarDados() {      
        this.dadoUm =  Math.floor(Math.random() * 6) + 1;
        this.dadoDois = Math.floor(Math.random() * 6) + 1;   
        this.jogouDados = true;

    }
    resertarDados() {
        this.jogouDados = false;
    }
}