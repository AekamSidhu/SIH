import '../Cards/card.css'
export default function Card({image,title,info}){
    return(
        <div className="card">
            <img src={image}></img>
            <h1>{title}</h1>
            <p>{info}</p>
        </div>
    )
}