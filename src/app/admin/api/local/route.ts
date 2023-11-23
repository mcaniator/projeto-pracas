import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export  default  async (req: NextApiRequest, res: NextApiResponse) => {
    
    try{
        if(req.method !== "POST"){
            
            return res.status(405).json({message: 'Method not allowed'})
        }
        else{
            const content = JSON.parse(req.body)
            //console.log(content)
            const local = await prisma.local.create({
                data:{
                    nome: content.nome,
                    tipo: content.tipo,
                    categoriaEspacoLivre: content.categoriaEspacoLivre,
                    observacoes: content.observacoes,
                    anoCriacao:content.anoCriacao,
                    anoReforma: content.anoReforma,
                    prefeitoCriacao: content.prefeitoCriacao,
                    legislacao: content.legislacao,
                    areaUtil: content.areaUtil,
                    areaPrefeitura: content.areaPrefeitura,
                    inclinacao: content.inclinacao,
                    regiaoUrbana: content.regiaoUrbana,
                    inativoNaoLocalizado: content.inativoNaoLocalizado,
                    //poligono: poligono, //<-Como inserir?
                    poligonoArea: content.poligonoArea,
                    createdAt: content.createdAt,
                    updatedAt: content.updatedAt
                }
            })

            res.json(local)
        }
    }
    catch(error){
        console.log("erro")
        console.log(error)
        res.status(500)
    }
    
}