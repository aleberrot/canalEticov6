export interface DelitoOption{
    codigo: string;
    tipificacion: string;
    descripcion: string
}

export const DELITOS: DelitoOption[] = [
    {
        codigo: "DEL-001",
        tipificacion: "Cohecho a funcionario público nacional o extranjero ",
        descripcion:
        "Comete este delito quien ofrece o consiente en ofrecer o entregar a un empleado público un beneficio económico, en provecho de éste o de un tercero, para que realice acciones u omisiones con infracción a los deberes de su cargo.",
    },
    {
        codigo: "DEL-002",
        tipificacion: "Lavado de Activos",
        descripcion:
        "Comete este delito quien oculta o disimula el origen ilícito de determinados bienes, a sabiendas que provienen de la perpetración de hechos constitutivos de delitos.",
    },
        {
        codigo: "DEL-003",
        tipificacion: "Financiamiento Terrorista",
        descripcion:
        "Comete este delito toda persona que por cualquier medio solicite, recaude o provea fondos con la finalidad que se utilicen en la comisión de delitos terroristas.",
    },
    {
        codigo: "DEL-004",
        tipificacion: "Receptación",
        descripcion:
        "El delito lo comete quien tiene en su poder cosas robadas o hurtadas sabiendo su origen ilícito, o quien compra o vende cosas robadas o hurtadas. ",
    },
        {
        codigo: "DEL-005",
        tipificacion: "Ambiente Laboral y seguridad",
        descripcion:
        "Es prioridad de la empresa generar una ambiente de trabajo seguro, si esto no se cumple, debe ser informado para que se puedan adoptar las medidas correctivas necesarias.",
    },
  {
    codigo: "DEL-006",
    tipificacion: "Protección de Bienes de la empresa",
    descripcion: "Es responsabilidad de cada uno proteger los bienes de la empresa incluyendo la información, el mal uso o descuido debe reportarse.",
  },
  {
    codigo: "DEL-007",
    tipificacion: "Uso de Bienes de la empresa para fines personales",
    descripcion: "Falta a la ética quien hace uso de recursos de la empresa, ya sean personas o elementos materiales para su beneficio particular o de terceros relacionados con él.",
  },
  {
    codigo: "DEL-008",
    tipificacion: "Atención y regalos",
    descripcion: "Corresponde denunciar aquellos casos en que se reciben o se entregan regalos o atenciones que puedan ser interpretados como que interfieren en la independencia que se debe tener para tomar decisiones.",
  },
  {
    codigo: "DEL-009",
    tipificacion: "Relación con proveedores",
    descripcion: "La selección de proveedores debe basarse en criterios técnico-económicos pensado en el mejor interés de la empresa. Cualquier situación que pueda interpretarse como irregular en este sentido, es materia de denuncia. ",
  },
  {
    codigo: "DEL-010",
    tipificacion: "Sustentabilidad y medio Ambiente",
    descripcion: "Es un principio de la empresa proteger la conservación de los recursos marinos y el medio ambiente en general. Eventos relacionados con esta materia deben ser informados.",
  },
  {
    codigo: "DEL-011",
    tipificacion: "Discriminación",
    descripcion: "Comete esta infracción quien hace exclusiones, distinciones o preferencias basadas en la raza, color, sexo, edad, estado civil, sindicación, religión, opinión política, nacionalidad u origen social, y que tengan por objeto anular o alterar la igualdad de oportunidades o de trato en el empleo y la ocupación.",
  },
  {
    codigo: "DEL-012",
    tipificacion: "Conflicto de intereses",
    descripcion: "Comete esta infracción quien a sabiendas de detentar alguna posición que le dificulte desempeñarse con independencia y objetividad en sus funciones, realice un acto que involucre un conflicto de interés, conforme las políticas vigentes, en beneficio propio o de terceros.",
  },
  {
    codigo: "DEL-013",
    tipificacion: "Libre Competencia",
    descripcion: "Se debe denunciar cualquier actitud o conducta que tenga relación con la colusión por parte de ejecutivos o personal que ocupe una posición de representación de la compañía, respecto de acuerdos o transacciones que se aparten de las condiciones de libre competencia.",
  },
  {
    codigo: "DEL-014",
    tipificacion: "Otros principios",
    descripcion: "Mencionados en el Código de Ética tales como: Representación de la Empresa, Relación con los clientes, Manejo de información, Exactitud de la información y Propiedad intelectual.",
  },
  {
    codigo: "DEL-015",
    tipificacion: "Fraude",
    descripcion: "Esta falta se refiere a la materialización o intención de defraudar a la compañía ya sea que sea por algún colaborador de la empresa o por alguien externo (cliente o proveedor) o entre ambos.  Por lo general se trata de obtener pagos por servicios no otorgados o realizado para fines personales de los defraudadores. ",
  },
  {
    codigo: "DEL-016",
    tipificacion: "Conflicto de intereses",
    descripcion: "1.-Segundo empleo, 2.-Segundo empleo para clientes, proveedores, competidores o socios, 3.-Integrar la extructura de otra empresa, 4.- Participación financiera en otras empresas, 5.-Contratación  de personal que tenga un vínculo de proximidad con otros colaboradores de la empresa, 6.-Empleo de personas con vínculos personales de próximidad con los colaboradores de la empresa en firmas de clientes, proveedores o socios.",
  },
  {
    codigo: "DEL-017",
    tipificacion: "Beneficio persona, soborno, corrupción",
    descripcion: "1.-Beneficios personal 2.-Regalos de terceros 3.-Otros regalos a terceros 4.-Regalos a partidos políticos, políticos y organizaciones políticas.",
  },
  {
    codigo: "DEL-018",
    tipificacion: "Confidencialidad y activos corporativos",
    descripcion: "1.- Registros e información 2.- Comunicación interna y externa 3.- Intercambio de información confidencial con clientes, proveedores y socios 4.- Disputas legales.",
  },
  {
    codigo: "DEL-019",
    tipificacion: "Beneficio económico para empleado publico",
    descripcion: "Comete este delito quien ofrece o consiente en ofrecer o entregar a un empleado público un beneficio económico, en provecho de éste o de un tercero, para que realice acciones u omisiones con infracción a los deberes de su cargo.",
  },
  {
    codigo: "DEL-020",
    tipificacion: "Clientes, proveedores, competidores y socios",
    descripcion: "1.-Conducta a observar con clientes 2.- Boicots (Celebrar un convenio con un cliente, proveedor, competidor o socio de la empresa para no realizar negocios, entregar mercaderías o prestar servicios a algún otro cliente, proveedor, competidor, socio o prestador de servicios) 3.- Contratos exclusivos 4.- Convenios de reciprocidad 5.- Modificaciones a los contratos 6.- Conducta con proveedores 6.1.-Licitaciones y estimados 6.2.-Consultores externos 6.3.-Conducta con competidores 7.- Conducta con competidores 7.1.- Fijación de precios entre competidores 7.2.- Restricciones para competir 7.3.- Contacto con competidores 7.4.- Conseguir información de los competidores.",
  },
  {
    codigo: "DEL-021",
    tipificacion: "Igualdad de oportunidades de empleos y hostigamiento",
    descripcion: "La empresa tiene un compromiso hacia una política de igualdad de oportunidades en el empleo para colaboradores y candidatos que soliciten trabajo en la empresa. Mathiesen no discrimina a candidatos calificados, por su raza, sexo, embarazo, ciudadanía, religión, edad, discapacidad física, estado civil, condición médica, orientación sexual ó cualquier otra característica protegida por Ley. La igualdad de oportunidad en el empleo se hará extensiva a toda persona involucrada en cualquier aspecto de la relación laboral, incluyendo: selección, contratación, capacitación, promoción, transferencias, despido ó terminación laboral. Mathiesen asegurará un ambiente de trabajo profesional, donde los colaboradores estén libres de cualquier tipo de acoso ó discriminación. Mathiesen no tolerará acoso hacia sus colaboradores, de parte de cualquier persona incluyendo a: supervisores gerentes, colegas de trabajo, distribuidores, clientes, proveedores, etc. Está específicamente prohibido el acoso de cualquier tipo a sea verbal, físico ó visual.",
  },
  {
    codigo: "DEL-022",
    tipificacion: "Negociación incompatible",
    descripcion: "La negociación incompatible es un delito de peligro (no requiere resultado) consistente en interesarse en cualquier, negociación, actuación, contrato u operaciones por funcionarios públicos, liquidadores, administradores, en que toman interés en razón de su cargo o funciones. Se trata de hipótesis de grave conflicto de interés.",
  },
  {
    codigo: "DEL-023",
    tipificacion: "Corrupción entre privados",
    descripcion: "Corrupción entre privados (corrupción entre particulares, dice el Código Penal) es donde al empleado o mandatario que solicitare o aceptare recibir un beneficio económico o de otra naturaleza, para sí o un tercero, para favorecer o por haber favorecido en el ejercicio de sus labores la contratación con un oferente sobre otro.",
  },
  {
    codigo: "DEL-024",
    tipificacion: "Apropiación indebida",
    descripcion: "Consiste en la apropiación de dineros, efectos o cosa mueble, en virtud de un contrato legalmente válido, que obliga a su restitución causando perjuicio.",
  },
  {
    codigo: "DEL-025",
    tipificacion: "Violación a la libre competencia/colusión",
    descripcion: "Comete esta infracción quien realice un acuerdo expreso o tácito o prácticas concertadas entre dos o más competidores, con el objeto de: (fijar precios de venta, compra u otras condiciones de comercialización; asignar zonas o cuotas del mercado; limitar la producción; excluir competidores; afectar el resultado de procesos de licitación; acuerdos de exclusividad que dañe la libre competencia; entre otros).",
  },
  {
    codigo: "DEL-026",
    tipificacion: "Uso de información confidencial o privilegiada",
    descripcion: "La Información Confidencial recibida de un cliente o de la empresa, esta solamente deberá ser utilizada con el propósito para el cual tal información fue suministrada. La Información Confidencial no debe emplearse incorrectamente, como por ejemplo, en beneficio personal del empleado.",
  },
  {
    codigo: "DEL-027",
    tipificacion: "Contaminación de aguas",
    descripcion: "Delito al que sin autorización, o contraviniendo sus condiciones o infringiendo la normativa aplicable introdujere o mandare introducir en el mar, ríos, lagos o cualquier otro cuerpo de agua, agentes contaminantes químicos, biológicos o físicos que causen daño a los recursos hidrobiológicos (por ejemplo, peces, moluscos, crustáceos, entre otras especies).",
  },
  {
    codigo: "DEL-028",
    tipificacion: "Violación de veda de productos",
    descripcion: "Delito al procesamiento, transformación, transporte, comercialización y almacenamiento de recursos hidrobiológicos vedados, y la elaboración, comercialización y almacenamiento de productos derivados de éstos.",
  },
  {
    codigo: "DEL-029",
    tipificacion: "Pesca ilegal de recursos del fondo marino",
    descripcion: "Delito  al que realice actividades extractivas en áreas de manejo y explotación de recursos del fondo marino, sin ser titular de los derechos correspondientes.",
  },
  {
    codigo: "DEL-030",
    tipificacion: "Procesamiento y almacenamiento ilegal de productos escasos",
    descripcion: "Delito al que procese, elabore o almacene recursos hidrobiológicos o productos derivados de ellos, respecto de los cuales no acredite su origen legal, y que correspondan a recursos en estado de colapsado o sobreexplotado.",
  },
  {
    codigo: "DEL-031",
    tipificacion: "Simulación o engaño para la obtención de beneficios (temporal)",
    descripcion: "Simulación o engaño para la obtención de beneficios (temporal)",
  },
  {
    codigo: "DEL-032",
    tipificacion: "Simulación o engaño para la obtención de beneficios mayores (temporal)",
    descripcion: "Simulación o engaño para la obtención de beneficios mayores (temporal)",
  },
  {
    codigo: "DEL-033",
    tipificacion: "Inobservancia del aislamiento u otra medida preventiva dispuesta por la autoridad sanitaria en caso de epidemia o pandemia",
    descripcion: "Art. 318 bis: sanciona a quienes en contexto de pandemia, epidemia o contagio generen, a sabiendas, riesgo de propagación de agentes patológicos con infracción de una orden de la autoridad sanitaria. Art. 318 ter: Sanciona a los empleadores que, a sabiendas y teniendo autoridad para disponer del trabajo de un subordinado, le ordenen concurrir a su lugar de trabajo cuando éste sea distinto a su domicilio o residencia, y el trabador se encuentre en cuarentena o aislamiento sanitario obligatorio decretado por la autoridad sanitaria.",
  },
  {
    codigo: "DEL-034",
    tipificacion: "Tenencia de armas de fuego sin autorización",
    descripcion: "Tener la posesión o tenencia de armas de fuego o explosivos sin las autorizaciones o inscripciones correspondientes; la comercialización, fabricación, importación e internación al país de armas, artefactos y municiones prohibidas o sujetas a control; y la venta de municiones o cartuchos a quien no es poseedor, tenedor o portador de un arma de fuego inscrita, entre otros.",
  },
  {
    codigo: "DEL-035",
    tipificacion: "Trata de personas",
    descripcion: "La trata de personas a aquel que “mediante violencia, intimidación, coacción, engaño, abuso de poder, aprovechamiento de una situación de vulnerabilidad o de dependencia de la víctima, o la concesión o recepción de pagos u otros beneficios para obtener el consentimiento de una persona que tenga autoridad sobre otra capte, traslade, acoja o reciba personas para que sean objeto de alguna forma de explotación sexual”.",
  },
  {
    codigo: "DEL-036",
    tipificacion: "Acoso Laboral",
    descripcion: "Entendiéndose por tal, toda conducta que constituya agresión u hostigamiento ejercida por la o el empleador o por uno o más trabajadores y trabajadoras, en una sola vez o de manera reiterada, y que tenga como resultado para la o las personas afectadas su menoscabo, maltrato o humillación; o bien que amenace o perjudique su situación laboral o sus oportunidades en el empleo.",
  },
  {
    codigo: "DEL-037",
    tipificacion: "Violencia en el trabajo",
    descripcion: "La violencia en el trabajo ejercida por terceros ajenos a la relación laboral, entendiéndose por tal aquellas conductas que afectan a las y los trabajadores, con ocasión de la prestación de servicios, por parte de las y los clientes, proveedores, usuarios, entre otros",
  },
  {
    codigo: "DEL-038",
    tipificacion: "Igualdad ",
    descripcion: "La igualdad es el principio que reconoce que todas las personas tienen los mismos derechos y obligaciones, y que deben ser tratadas de manera idéntica sin importar su raza, sexo, clase social, creencias religiosas, discapacidades, o cualquier otra circunstancia que pueda generar diferencias.",
  },
  {
    codigo: "DEL-039",
    tipificacion: "Inclusión",
    descripcion: "La inclusión es el acto de aceptar a todas las personas como iguales, independientemente de sus características, y garantizar que tengan acceso a las mismas oportunidades y servicios. También puede referirse a la creación de un entorno que promueva el sentido de pertenencia de una persona o grupo.",
  },
  {
    codigo: "DEL-040",
    tipificacion: "Discapacidad",
    descripcion: "La Discapacidad se caracteriza por limitaciones para el desempeño de una actividad rutinaria considerada regular, las cuales pueden ser temporales o permanentes, reversibles o surgir como consecuencia directa de deficiencias físicas, sensoriales, de secuela de enfermedades o por eventos traumáticos (accidentes).",
  },
  {
    codigo: "DEL-041",
    tipificacion: "Exclusión",
    descripcion: "La exclusión es la acción de sacar a alguien o algo de un lugar o de una situación, o de dejarlo por fuera. También puede significar la privación de derechos sociales, políticos o culturales.",
  },
  {
    codigo: "DEL-042",
    tipificacion: "Perspectiva de género",
    descripcion: "La perspectiva de género se centra especialmente en las diferencias de género en cuanto a estatus y poder, y considera cómo esa discriminación configura las necesidades inmediatas, así como los intereses a largo plazo, de mujeres y hombres.",
  },
  {
    codigo: "DEL-043",
    tipificacion: "Conciliación vida laboral - familiar",
    descripcion: "La conciliación de la vida laboral y familiar es el equilibrio entre el tiempo que se dedica al trabajo y al resto de las actividades personales y familiares.",
  },
  {
    codigo: "DEL-044",
    tipificacion: "Otros tipos de denuncias no tipificadas y consultas",
    descripcion: "Cualquier situación que el denunciante considere debe ser reportada, o que le genere algún dilema ético sobre el que quiera consultar",
  },
] as const;

const ACOSO_SEXUAL_LEY_KARIN: DelitoOption = {
  codigo: "DEL-045",
  tipificacion: "Acoso Sexual",
  descripcion:
    "Requerimientos de carácter sexual no consentidos que provoquen amenaza, ofensa, humillación o un ambiente intimidatorio, hostil u ofensivo.",
};

const TIPIFICACIONES_LEY_KARIN = [
  "Acoso Laboral",
  "Acoso Sexual",
  "Violencia en el trabajo",
  "Discriminación",
] as const;

export const DELITOS_LEY_KARIN = TIPIFICACIONES_LEY_KARIN.map(
  (tipificacion) => {
    if (tipificacion === ACOSO_SEXUAL_LEY_KARIN.tipificacion) {
      return ACOSO_SEXUAL_LEY_KARIN;
    }

    const delito = DELITOS.find(
      (option) =>
        option.tipificacion.toLocaleLowerCase("es") ===
        tipificacion.toLocaleLowerCase("es"),
    );

    if (!delito) {
      throw new Error(`Tipificación Ley Karin no encontrada: ${tipificacion}`);
    }

    return delito;
  },
);

export const obtenerDelitoPorCodigo = (codigo: string): DelitoOption | undefined =>
  [...DELITOS, ...DELITOS_LEY_KARIN].find(
    (delito) => delito.codigo === codigo,
  );

export const obtenerDelitoPorTipificacion = (tipificacion: string): DelitoOption | undefined =>
  [...DELITOS, ...DELITOS_LEY_KARIN].find(
    (delito) => delito.tipificacion === tipificacion,
  );

export const DELITOS_GENERALES = DELITOS.filter(
  (delito) => !DELITOS_LEY_KARIN.some((karin) => karin.codigo === delito.codigo),
);

