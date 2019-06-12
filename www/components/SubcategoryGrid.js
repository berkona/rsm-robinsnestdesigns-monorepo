import React from "react"

const SubcategoryGrid = (props) => (
  <table border="0" cellSpacing="0" cellPadding="5" align="center">
    <tbody>
      {
        props.categories.map((category, index, arr) => {
          var nEdges = arr.length;
          var makeTD = (idx) => (
            <td>
              <table className="subcategory">
                <tbody>
                  <tr>
                    <td>
                      <div className="subcategory">
                        {props.children(arr[idx])}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          )
          if (index % 3 !== 0) {
            return null
          } else  {
            return (
              <tr key={`subcategory-grid-${props.categoryId}-${arr[index].id}`}>
                { makeTD(index) }
                { index < nEdges - 1 ? makeTD(index+1) : <td></td> }
                { index < nEdges - 2 ? makeTD(index+2) : <td></td> }
              </tr>
            )
          }
        })
        .filter(x => x !== null)
      }
    </tbody>
  </table>
)

export default SubcategoryGrid
