"use-strict";

import React from 'react';

function getNodeIcon(node) {
    if (node.type === "workplan") {
        return <span className="tree-icon glyphicons glyphicons-cube-empty"/>
    } else if (node.type === "selective") {
        return <span className="tree-icon glyphicons glyphicons-list-numbered"/>
    } else if (node.type === "workplan-setup") {
        return <span className="tree-icon glyphicons glyphicons-cube-black"/>
    }else if (node.type === "workingstep") {
        return <span className="tree-icon glyphicons glyphicons-blacksmith"/>
    } else {
        return <span className="tree-icon glyphicons glyphicons-question-sign"/>
    }
}

function hasActiveChildren(node, id){
    if(node.id === id){
      return "active";
    }
    else if(!node.leaf){
      for(let i = 0; i < node.children.length; i++){
        if(hasActiveChildren(node.children[i],id) === "active"){
            if(node.toggled === false){
                return "active";  
            }
            else{
                return "child-active";
            }
       
        }
        else if(hasActiveChildren(node.children[i],id) ==="child-active"){
            if (node.toggled === false){
                 return "active";
            }
            else{
                return "child-active";
            }
        }
      }

    }
    return "inactive";    
}

const Container = (props) => {
    //console.log("CONTAINER");
    //console.log(props);
    let node = props.node;
    node.icon = getNodeIcon(node);
    
    let innerName = "inner";
    let outerName = "node";
    if (hasActiveChildren(node, props.decorators.ws) === "active") {
        innerName += " running-node";
    } else if (node.enabled === false) {
        innerName += " disabled";
    }
    let toggleName = "toggle";
    if (node.leaf === true) {
        toggleName = "toggle-hidden";
    } else if (node.toggled === true) {
        toggleName += " glyphicon glyphicon-chevron-down";
    } else {
        toggleName += " glyphicon glyphicon-chevron-right";
    }
    
    return (
        <div
            id={node.id}
            className={outerName}
        >
            <div 
                className={toggleName}
                onClick={props.onClick}
            />
            <div
                className={innerName} onClick={(event)=>{props.decorators.propertyCb(node)}}
            >
                {node.icon}
                <span className="node-text">
                    {node.name}
                </span>
            </div>
        </div>
    );
}

const decorators = {
    Container
}

const style_default = {
    tree: {
        base: {
            listStyle: 'none',
            backgroundColor: '#21252B',
            margin: 0,
            padding: '2px',
            overflowY: 'scroll',
            maxHeight: 'inherit',
            color: '#9DA5AB'
        },
        node: {
            base: {
                position: 'relative'
            },
            link: {
                cursor: 'pointer',
                position: 'relative',
                padding: '0px 5px',
                display: 'block'
            },
            activeLink: {
                background: '#31363F'
            },
            toggle: {
                base: {
                    position: 'relative',
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginLeft: '-5px',
                    height: '24px',
                    width: '24px'
                },
                wrapper: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    margin: '-7px 0 0 -7px',
                    height: '14px'
                },
                height: 14,
                width: 14,
                arrow: {
                    fill: '#9DA5AB',
                    strokeWidth: 0
                }
            },
            header: {
                base: {
                    display: 'inline-block',
                    verticalAlign: 'top',
                    color: '#9DA5AB'
                },
                connector: {
                    width: '2px',
                    height: '12px',
                    borderLeft: 'solid 2px black',
                    borderBottom: 'solid 2px black',
                    position: 'absolute',
                    top: '0px',
                    left: '-21px'
                },
                title: {
                    lineHeight: '24px',
                    verticalAlign: 'middle'
                }
            },
            subtree: {
                listStyle: 'none',
                paddingLeft: '19px'
            },
            loading: {
                color: '#E2C089'
            }
        }
    }
}

const style = {
    tree: {
        base: {
            listStyle: 'none'
        },
        node: {
            base: {
                listStyle: 'none'
            }
        }
    }
}

export default {
    decorators,
    style
}
