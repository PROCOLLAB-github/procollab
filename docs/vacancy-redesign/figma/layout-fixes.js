
const section=await figma.getNodeByIdAsync("51:1751"),proposal=await figma.getNodeByIdAsync("51:1752");
const mutated=[];function change(n){mutated.push(n.id);return n;}
for(const scope of [proposal,section]){
 for(const n of scope.findAll(n=>n.type==="INSTANCE"&&n.name.startsWith("Status /"))){const value=Object.values(n.componentProperties).find(p=>p.type==="TEXT")?.value;if(typeof value!=="string")continue;const width=Math.max(84,value.length*7.5+28);change(n).resize(width,n.height);n.layoutSizingVertical="HUG";n.clipsContent=false;}
}
const mobileIds=["56:2311","56:2736","56:3062","56:3475","56:3841"];
for(const id of mobileIds){const root=await figma.getNodeByIdAsync(id);
 const rowIds=root.findAll(n=>n.type==="FRAME"&&["Role + status","Vacancy + response state","Candidate + response state","Full role + state","Actions"].includes(n.name)).map(n=>n.id);
 for(const rowId of rowIds){let row=await figma.getNodeByIdAsync(rowId);change(row).layoutMode="VERTICAL";row.primaryAxisAlignItems="MIN";row.counterAxisAlignItems="MIN";row.clipsContent=false;
 for(const c of row.children){change(c);if(c.type==="TEXT"){c.textAutoResize="HEIGHT";c.layoutSizingHorizontal="FILL";c.layoutSizingVertical="HUG";}else if(c.type==="INSTANCE"&&c.name.startsWith("Button")){c.resize(row.width,36);c.layoutSizingHorizontal="FILL";c.layoutSizingVertical="FIXED";}else{c.layoutSizingVertical="HUG";if(c.type==="FRAME")c.layoutSizingHorizontal="FILL";}}
 row=await figma.getNodeByIdAsync(rowId);row.layoutSizingHorizontal="FILL";row.layoutSizingVertical="HUG";
 }
 // Width must be based on actual card slot, especially nested modal cards.
 for(const row of root.findAll(n=>n.type==="FRAME"&&n.name==="Навыки / перенос строк"))for(const chip of row.children){if(chip.width>row.width){change(chip).resize(row.width,chip.height);chip.layoutSizingVertical="HUG";}}
}
for(const id of ["56:3187","56:3219"]){const modal=await figma.getNodeByIdAsync(id);const row=modal.children.find(n=>n.name==="Actions");change(row).layoutMode="VERTICAL";row.primaryAxisAlignItems="MIN";row.counterAxisAlignItems="MIN";row.clipsContent=false;for(const b of row.children){change(b).resize(modal.width-48,40);b.layoutSizingHorizontal="FILL";b.layoutSizingVertical="FIXED";}row.layoutSizingHorizontal="FILL";row.layoutSizingVertical="HUG";change(modal).layoutSizingVertical="HUG";}
for(const rootId of ["56:2148","56:2472"]){const root=await figma.getNodeByIdAsync(rootId);const rowIds=root.findAll(n=>n.type==="FRAME"&&n.name==="Card row").map(n=>n.id);for(const id of rowIds){const row=await figma.getNodeByIdAsync(id);for(const n of row.children){n.layoutSizingVertical="HUG";const card=n.children[0];card.layoutSizingVertical="HUG";const slot=card.findOne(x=>x.type==="SLOT");slot.layoutSizingVertical="HUG";slot.children[0].layoutSizingVertical="HUG";}
 const max=Math.max(...row.children.map(n=>n.height));
 for(const n of row.children){change(n).resize(n.width,max);n.layoutSizingVertical="FIXED";const card=n.children[0];change(card).layoutSizingVertical="FILL";const slot=card.findOne(x=>x.type==="SLOT");change(slot).layoutSizingVertical="FILL";const content=slot.children[0];change(content).layoutSizingVertical="FILL";content.primaryAxisAlignItems="SPACE_BETWEEN";}
}}
const declineNodes=section.findAll(n=>n.type==="INSTANCE"&&n.name==="Button / outline / Отклонить");
for(const n of declineNodes){change(n).swapComponent(sources["53:1807"]);prop(n,"Label","Отклонить");n.resize(n.width,36);n.layoutSizingVertical="FIXED";}
// EmptyState and Select child text must follow the context width.
const state=await figma.getNodeByIdAsync("58:3086");
for(const n of state.findAll(n=>n.type==="INSTANCE"&&(n.name.startsWith("EmptyState")||n.name.startsWith("Select /")||n.name.startsWith("Search /")))){
 for(const ch of n.children){if(ch.type==="TEXT"||ch.type==="FRAME"){change(ch).layoutSizingHorizontal="FILL";if(ch.type==="TEXT")ch.textAutoResize="HEIGHT";}}
}
const wrapper=await figma.getNodeByIdAsync("51:1753");section.resizeWithoutConstraints(2130,wrapper.height+180);
return {mutatedNodeIds:[...new Set(mutated)],fixed:["mobile row axes and child heights","single-line statuses","success action stack","desktop equal card heights","decline destructive outline","nested mobile skill width"],existingMastersMutated:[],sectionHeight:section.height};
