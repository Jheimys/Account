
//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

//modulos internos
const fs = require('fs')

//Operações da conta
function opretaion(){
    inquirer.prompt([
            {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer',
            choices: ['Criar conta', 'Consultar saldo', 'Depositar', 'Sacar', 'Sair'],
        },
    ])
    .then((answer) => {
        const action = answer['action']

        if(action === 'Criar conta'){
            creatAccount()

        } else if(action === 'Depositar' ) {
            deposit()

        } else if(action === 'Sair') {
            console.log(chalk.bgBlue.black('obrigado por usar o Acconts!'))
            process.exit()
        } else if (action === 'Consultar saldo') {
            getAccountBalance()
        } else if (action === 'Sacar'){
            withdraw()
        }
    })
    .catch((err) => console.log(err))

}

//create an account
function creatAccount(){
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
    console.log(chalk.green('Defina as opções de sua consta a seguir'))
    buildAccont()
}

//definições da conta
function buildAccont(){
    inquirer.prompt([
        {
            name:'accountName',
            message:'Digite um nome para sua conta:'
        }
    ])
    .then(answer => {
        const accountName = answer['accountName']
        
        //console.info(accountName)

    
        if(!fs.existsSync('accounts')){                      //vai criar o ditetório
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)){  // a conta existe no diretório?
            console.log(                                    // Se sim, retorna buildAccont()
                chalk.bgRed.black('Esta conta já existe, escolha outra nome!')
            )                                        // se não, é crida pelo fs.writeFileSync

            buildAccont()
            return
        }
        //cria o arquivo
        fs.writeFileSync(
            `accounts/${accountName}.json`, 
            '{"balance": 0}',
            function(err){
                console.log(err)
            },
        )

        console.log(chalk.green('Parabéns sua conta foi criada!'))
        opretaion()
    })
    .catch(err => console.log(err))
}

opretaion()

//depositando dinheiro na  conta
function deposit() {
    inquirer.prompt([{
        name: 'accountName',
        message:'Qual o nome da sua conta?'
    }])
    .then(answer => {
        const accountName = answer['accountName']

        //A conta existe? se não:
        if(!checkAccount(accountName)) {
            return deposit()

        }
        //Se a conta existe:
        inquirer.prompt([
                {
                name: 'amount',
                message: 'Quanto deseja depositar?',
            }
        ])
        .then(answer => {
            const amount = answer['amount']
            //fazendo deposito 
            addAmount(accountName, amount)  //Para fazer o deposito presiso da conta e valor
                                                   

            opretaion()
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
}

//Verificando se a conta existe
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Essa conta não existe!'))
        return false
    }

    return true
}

//estou pegando uma conta pelo nome e add uma quantia
function addAmount(accountName, amount){ 
    const accountData = getAccount(accountName) //dados da contas.
    //console.log(account)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um error, tente novamenente mais tarde!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
    

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi depositado R$${amount} na sua conta`))
   
}

function  removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return withdraw()
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return withdraw() 
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi Sacado R$${amount} da sua conta`))
    opretaion()

}



function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
        encoding:'utf8',
        flag:'r',
    })
    
    return JSON.parse(accountJSON)
}


//Consultar saldo
function  getAccountBalance() {
    inquirer.prompt([
        {
            name:'accountName',
            message:'Qual o nome da conta?',
        }
        
    ])
    .then(answer => {
        const accountName = answer['accountName']

        //veficar se a conta existe
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`O saldo da conta é R$${accountData.balance}`))
        opretaion()
    })
    .catch(err => console.log('err'))
}

function  withdraw(){
    inquirer.prompt([
        {
            name:'accountName',
            message:'Qual o nome da conta?',
        }
    ])
    .then( answer => {
        const accountName = answer['accountName']

        //verificação da conta
        //Se não existir
        if(!checkAccount(accountName)){
            return withdraw()
        }

        //caso exista
        inquirer.prompt([
            {
                name:'amount',
                message:'Quanto deseja sacar?',
            }
        ])
        .then(answer => {
            const amount = answer['amount']
            removeAmount(accountName, amount)
          
        })
        .catch(err => console.log(err))


    })
    .catch(err => console.log(err))
}

