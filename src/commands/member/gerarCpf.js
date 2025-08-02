const {PREFIX,ASSETS_DIR} = require(`${BASE_DIR}/config`)
const path = require("path")

function gerarCpfSP() {
  let numeros = [];
  for (let i = 0; i < 8; i++) {
    numeros.push(Math.floor(Math.random() * 10));
  }
 
  numeros.push(8);

 
  function calcularDigito(numeros, pesoInicial) {
    let soma = 0;
    for (let i = 0; i < numeros.length; i++) {
      soma += numeros[i] * (pesoInicial - i);
    }
    let resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

 
  let digito1 = calcularDigito(numeros, 10);
  let digito2 = calcularDigito([...numeros, digito1], 11);


  let cpfArray = [...numeros, digito1, digito2];


  let cpfFormatado = cpfArray.join('');
  cpfFormatado = cpfFormatado.replace(/(\d{3})(\d)/, '$1.$2');
  cpfFormatado = cpfFormatado.replace(/(\d{3})(\d)/, '$1.$2');
  cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{2})$/, '$1-$2');

  return cpfFormatado;
}

const imagePath = path.join(ASSETS_DIR,"images","cpf.jpg")
module.exports ={
  name:"gerarCpf",
  descripition:"gera um cpf de sp",
  commands:["gerarCpf"],
  usage:`${PREFIX}gerarCpf`,
  
    /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
   handle: async ({socket,sendImageFromFile})=>{
    const cpf = gerarCpfSP() 
     await sendImageFromFile(
       imagePath,
       `cpf gerado:${cpf}`
       )
     
   }
   
}
