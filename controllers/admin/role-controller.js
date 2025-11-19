const Role = require("../../models/role_model")
const systemConfig = require("../../config/system")
// [GET] /admin/role

module.exports.index = async (req,res) => {
    let find = {
        deleted: false
    }

    const records = await Role.find(find)
    res.render("admin/pages/roles/index",{
        pageTitle: "Trang nhóm quyền ",
        records: records
    });
}
module.exports.create = async (req,res) => {

    res.render("admin/pages/roles/create",{
        pageTitle: "Tạo nhóm quyền "
    });

}
module.exports.createPost = async (req,res) => {
    const record = new Role(req.body)
    await record.save()

    res.redirect(`${systemConfig.prefixAdmin}/roles`)
}
module.exports.edit = async (req,res) => {
    try{
        const id = req.params.id
        console.log(id)
        let find = {
            _id:  id,
            deleted: false
        }

        const data = await Role.findOne(find)
        res.render("admin/pages/roles/edit",{
            pageTitle: "Chỉnh sửa nhóm quyền",
            data: data
        });
    } catch(error){
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
}
module.exports.editPatch = async (req,res) => {
    try {
        await Role.updateOne({_id: req.params.id},req.body)
        req.flash("success","Cập nhật thành công!")
    } catch (error) {
        req.flash("error","Cập nhật thất bại!")
    }
    res.redirect(req.get('Referrer'))
} 
module.exports.deleteItem = async (req,res) => {
    const id = req.params.id
    await Role.updateOne({ _id: id},{
            deleted: true,
            deletedAt: new Date()
        }
    )
    req.flash("success",`Xoá thành công !`)
    res.redirect(req.get('Referrer'));
}     
module.exports.permissions = async (req,res) => {
    let find = {
        deleted: false
    }
    const records = await Role.find(find)

    res.render("admin/pages/roles/permissions",{
        pageTitle: "Thông tin phân quyền ",
        records: records
    });

}
module.exports.permissionsPatch = async (req,res) => {
    const permissions = JSON.parse(req.body.permissions)

    for (const item of permissions) {
        await Role.updateOne({_id: item.id},{permissions: item.permissions})  
    }

    req.flash("success","Cập nhật quyền thành công")
    res.redirect(req.get('Referrer'))
}
