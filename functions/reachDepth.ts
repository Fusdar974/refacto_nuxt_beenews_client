const reachDepth = (attrLink: string, object: any) : any => {
    let attrSLink: string[] = attrLink.split(".")
    if (attrSLink.length === 1) {
        if(Array.isArray(object)){
            return object.map(o=> o[attrSLink[0]]).join(', ')
        }
        return object[attrSLink[0]]
    }
    else {
        let newAttrLink: string
        newAttrLink = ""

        for(let i = 1; i < attrSLink.length; i++) {
            if (i === attrSLink.length-1) {
                newAttrLink = newAttrLink.concat(attrSLink[i])
            } else {
                newAttrLink = newAttrLink.concat(attrSLink[i], ".")
            }
        }
        return reachDepth(newAttrLink, object[attrSLink[0]])
    }
}
export default reachDepth