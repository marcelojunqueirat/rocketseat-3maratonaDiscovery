const Modal = {
    openClose(){
        document.
            querySelector('.modal-overlay')
            .classList.toggle('active') /* Liga/ Desliga ao inves de criar duas funções com add e remove */
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all : Storage.get(),

    add(transaction){
      Transaction.all.push(transaction) 
      
      App.reload();
    },
    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },
    incomes(){
        let income = 0;
        // pegar todas as transações
        Transaction.all.forEach((transaction) => {
            // para cada transação, se for maior que 0
            if(transaction.amount > 0){
                // somar a uma variavel e retorna a variavel
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses(){
        let expense = 0;
        Transaction.all.forEach((transaction)=>{
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total(){
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#dataTable tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index){

        const CSSClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `
        return html
    },
    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    }, 
    clearTransaction(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatDate(date){
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatAmount(value){
        value = Number(value.replace(/\,\./g,"")) * 100 //Expressao regular tirando ponto e virgula de forma global e substituindo por vazio
        
        return value
    },
    formatCurrency(value){
        const signal = Number(value) <0 ? "-" : ""

        value = String(value).replace(/\D/g, "") //expressao regular que escapa todos as letras(so deixa numeros)

        value = Number(value) /100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        
        return signal + value

    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'), 
    getValues(){
        return {
            description : Form.description.value,
            amount : Form.amount.value,
            date : Form.date.value
        }
    },  
    validateField(){
        const {description, amount, date} = Form.getValues(); // desestrturando o objeto, pegando apenas o dado.
        if(description.trim() === "" ||
            amount.trim() === "" || 
            date.trim() === ""){
                throw new Error("Por favor, preencha todos os campos")
        }
    },
    formatValues(){
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    saveTransaction(transaction){
        Transaction.add(transaction)
    },
    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event){
        event.preventDefault();// nao deixa jogar na URL os dados

        try {
            //verificar se todas as informações foram preenchidas
            Form.validateField()
            //formatar os dados para salvar
            const transaction= Form.formatValues()
            //salvar
            Form.saveTransaction(transaction)
            //destruir os dados do formulario
            Form.clearFields()
            //fechar modal
            Modal.openClose()         
        } catch (error) {
            alert(error.message)
        }
    }
}

const App ={
    init() {

        Transaction.all.forEach((transaction, index)=>{
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransaction()
        App.init()
    }
}

App.init();
