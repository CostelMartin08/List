const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _=require("lodash");

const app =express();


mongoose.set('strictQuery', false);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


main().catch(err => console.log(err));
async function main() {

 await mongoose.connect("mongodb+srv://admin-costel:9tXd%40JKCNhqMn%40e@atlascluster.49fubwp.mongodb.net/todolistDB");

}
  const itemsSchema = {
  name: String
}
const Item =  mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name:"Welcome to your todo list"
});
const item2 = new Item ({
  name:"Hit the + button to add a new item"
});
const item3 = new Item({
  name:"Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);
//HOME ROUTE
app.get('/', (req, res) => {

Item.find({}, function(err, foundItems){

if(foundItems.length === 0) {
Item.insertMany(defaultItems, function(err){
if (err){
console.log(err);
} else{
console.log("Succes!");
    }
  });
  res.redirect("/");
}else{ res.render("list", { ora:"Today", listTitle: foundItems});
}
});

});


app.post('/', (req, res) =>{

const itemName = req.body.newItem;
const listName = req.body.list;
const newitem = new Item ({
  name: itemName
});

if (listName === "Today"){
newitem.save();
res.redirect("/");
}else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(newitem);
    foundList.save();
    res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
  const checkedItemId = (req.body.checkbox);
  const listName = (req.body.listName);

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
    console.log("remove!")
        res.redirect("/");
      }
    });
}else{
  List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/"+ listName);
    }
  });
 }


});




app.get("/:customListName", (req, res)=>{
const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }else{
     res.render("list", { ora:foundList.name, listTitle: foundList.items});
    }}

});




});

//PORT
app.listen(3000, () =>{
  console.log("Serverul ruleaza!");
})
