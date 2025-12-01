const Product = require("../../models/product_model")
const ProductCategory = require("../../models/product_category_model");
const searchHelper = require("../../helpers/search")
const productCategoryHelper = require("../../helpers/product_category")
const paginationHelper = require("../../helpers/pagination")
const productsHelper = require("../../helpers/products")
// [GET] /products
module.exports.index = async(req,res) => {
    let find = {
        status: "active",
        deleted: false
    }
    let objectSearch = searchHelper(req.query)
    if(objectSearch.regex){
        find.title = objectSearch.regex
    }
    const countProducts = await Product.countDocuments(find)

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 8
        },
        req.query,
        countProducts
    );

    const products = await Product.find(find).sort({position:"desc"}).limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

    const newProduct = productsHelper.priceNewProducts(products)
    res.render("client/pages/products/index",{
        pageTitle: "Danh sách sản phẩm",
        products: newProduct,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}
//[GET] /products/detail
module.exports.detail = async(req,res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slugProduct,
            status: "active"
        }
        
        const product = await Product.findOne(find)

        if(product.product_category_id){
            const category = await ProductCategory.findOne({
                _id: product.product_category_id,
                status: "active",
                deleted: false
            })
            product.category = category
        }
        product.priceNew = productsHelper.priceNewProduct(product)
        res.render("client/pages/products/detail",{
            pageTitle: product.title,
            product: product,
        })
    } catch (error) {
        res.redirect(`/products`)
    }
}
module.exports.category = async (req,res) => {
    let find = {
        slug: req.params.slugCategory,
        status: "active",
        deleted: false
    }
    let objectSearch = searchHelper(req.query)
    if(objectSearch.regex){
        find.title = objectSearch.regex
    }
    const countProducts = await Product.countDocuments(find)

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 8
        },
        req.query,
        countProducts
    );
    const category = await ProductCategory.findOne(find)

    const listSubCategory = await productCategoryHelper.getSubCategory(category.id)

    const listSubCategoryId = listSubCategory.map(item=>item.id)



    const products = await Product.find({
        product_category_id: {$in: [category.id,...listSubCategoryId]},
        deleted: false
    }).sort({position: "desc"}).limit(objectPagination.limitItem)
    .skip(objectPagination.skip)
    
    const newProduct = productsHelper.priceNewProducts(products)
    res.render("client/pages/products/index",{
        pageTitle: category.title,
        products: newProduct,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}