<script>
  import Dashboard from "$lib/components/Dashboard.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { userDetails } from "../../../stores/userDetails.js"
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import EditImageModal from "$lib/components/EditImageModal.svelte"

  let showAlertModal = false
  let alertModalOptions = {}

  let users = []
  let totalUsers = 0
  let images = []
  let totalImages = 0

  let clickedBox = "users"

  let imageIdGiven
  let userIdGiven

  let imageToEdit = {}

  let showEditImageModal = false

  const handleClick = (box) => {
    clickedBox = box
  }

  const getUsersAndImages = async () => {
    const responseUsers = await fetch(`http://localhost:4000/users`, {
      method: "GET",
      credentials: "include",
    })
    const responseImages = await fetch(`http://localhost:4000/images`, {
      method: "GET",
      credentials: "include",
    })
    const replyUsers = await responseUsers.json()
    const replyImages = await responseImages.json()

    if (responseUsers.ok) {
      users = [...replyUsers.data]
      totalUsers = replyUsers.totalUsers
    }
    if (responseImages.ok) {
      images = [...replyImages.data]
      totalImages = replyImages.totalImages
    }
  }

  const onAlertConfirm = () => {
    showAlertModal = false
  }

  // const handleImageEdit = async () => {
  //   const responseGET = await fetch(`http://localhost:4000/images/${imageIdToEdit}`, {
  //     method: "GET",
  //     credentials: "include",
  //   })
  //   const replyGET = await responseGET.json()
  //   console.log("🚀 ~ handleImageEdit ~ replyGET:", replyGET)
  //   imageToEdit = replyGET.data
  //   showEditImageModal = true
  // }

  const handleImageFlagging = async (flag) => {
    const response = await fetch(`http://localhost:4000/images/${imageIdGiven}`, {
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify({ isFlagged: flag }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    const reply = await response.json()

    if (response.ok) {
      alertModalOptions.header = "Operation succeeded"
      alertModalOptions.message = flag ? "Image has been flagged." : "Image has been unflagged."
      alertModalOptions.type = "success"
      showAlertModal = true
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
    await getUsersAndImages()
  }

  const handleImageDeletion = async (del) => {
    let response
    if (del) {
      response = await fetch(`http://localhost:4000/images/${imageIdGiven}`, {
        method: "DELETE",
        credentials: "include",
      })
    } else {
      response = await fetch(`http://localhost:4000/images/${imageIdGiven}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ destroyTime: null }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const reply = await response.json()

    if (response.ok) {
      alertModalOptions.header = "Operation succeeded"
      alertModalOptions.message = del ? "Image has been deleted." : "Image has been restored."
      alertModalOptions.type = "success"
      showAlertModal = true
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
    await getUsersAndImages()
  }

  const handleUserDeletion = async (del) => {
    let response
    if (del) {
      response = await fetch(`http://localhost:4000/users/${userIdGiven}`, {
        method: "DELETE",
        credentials: "include",
      })
    } else {
      response = await fetch(`http://localhost:4000/users/${userIdGiven}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ destroyTime: null }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const reply = await response.json()

    if (response.ok) {
      alertModalOptions.header = "Operation succeeded"
      alertModalOptions.message = del ? "User has been deleted." : "User has been restored."
      alertModalOptions.type = "success"
      showAlertModal = true
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
    await getUsersAndImages()
  }

  // const onEditConfirm = async (status, data) => {
  //   if (!status) {
  //     showEditImageModal = false
  //     return
  //   }
  //   if (data) {
  //     Object.keys(data).forEach((key) => (data[key] === undefined ? delete data[key] : {}))
  //   }

  //   showEditImageModal = false

  //   const responsePatch = await fetch(`http://localhost:4000/images/${imageIdToEdit}`, {
  //     method: "PATCH",
  //     credentials: "include",
  //     body: JSON.stringify(data),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })

  //   console.log("🚀 ~ onEditConfirm ~ imageToEdit:", imageToEdit)

  //   const replyPATCH = await responsePatch.json()
  //   if (responsePatch.ok) {
  //     alertModalOptions.header = "Successfully updated"
  //     alertModalOptions.message = replyPATCH.message
  //     alertModalOptions.type = "success"
  //     showAlertModal = true
  //   } else {
  //     alertModalOptions.header = "Could not update"
  //     alertModalOptions.message = replyPATCH.error
  //     alertModalOptions.type = "failure"
  //     showAlertModal = true
  //   }
  // }
  onMount(async () => {
    await getUsersAndImages()
    if (!$userDetails.isAdmin) {
      alertModalOptions.header = "Cannot access page"
      alertModalOptions.message = "This page is only accessible by an admin."
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  })
</script>

<div class="container">
  <Dashboard />
  <div class="contents">
    <div class="content">
      <h3>Statistics</h3>
      <div class="main-card">
        <div class="statistics">
          <button class="box blue {clickedBox === 'users' ? 'selected' : ''}" on:click={() => handleClick("users")}>
            <i class="fa-solid fa-users icon"></i>
            <p class="total-info">Total users</p>
            <p class="total-num">{totalUsers || " "}</p>
          </button>
          <button class="box green {clickedBox === 'images' ? 'selected' : ''}" on:click={() => handleClick("images")}>
            <i class="fa-regular fa-images icon"></i>
            <p class="total-info">Total images</p>
            <p class="total-num">{totalImages || " "}</p>
          </button>
          <div>
            <div class="small-box">
              <p class="total-info">Enter User ID:</p>
              <div class="edit-div">
                <input type="text" bind:value={userIdGiven} class="edit-input" />
                <!-- <button class="edit-button">Edit</button> -->
                <button class="edit-button" on:click={() => handleUserDeletion(true)}>Delete</button>
                <button class="edit-button" on:click={() => handleUserDeletion(false)}>Restore</button>
              </div>
            </div>
            <div class="small-box">
              <p class="total-info">Enter Image ID:</p>
              <div class="edit-div">
                <input type="text" bind:value={imageIdGiven} class="edit-input" />
                <!-- <button class="edit-button" on:click={handleImageEdit}>Edit</button> -->
                <button class="edit-button" on:click={() => handleImageFlagging(true)}>Flag</button>
                <button class="edit-button" on:click={() => handleImageFlagging(false)}>Unflag</button>
                <button class="edit-button" on:click={() => handleImageDeletion(true)}>Delete</button>
                <button class="edit-button" on:click={() => handleImageDeletion(false)}>Restore</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <br />
    <br />
    <br />
    <div class="content">
      {#if clickedBox === "images"}
        <div class="images-table">
          <table>
            <thead class="table-head">
              <tr class="table-head-row">
                <th>Image ID</th>
                <th>Title</th>
                <th>URL</th>
                <th>Description</th>
                <th>Owner ID</th>
                <th>Tags</th>
                <th>isFlagged</th>
                <th>createdAt</th>
                <th>updatedAt</th>
                <th>destroyTime</th>
              </tr>
            </thead>
            <tbody>
              {#if images}
                {#each images as image (image.id)}
                  <tr>
                    <td>{image.id}</td>
                    <td>{image.title}</td>
                    <td>{image.url}</td>
                    <!-- <td class={image.description && image.description.length > 7 ? "ellipsis" : ""}>{image.description}</td> -->
                    <td>{image.ownerId}</td>
                    <td>
                      {#each image.tags as tag}
                        {tag} &nbsp;
                      {/each}
                    </td>
                    <td>{image.isFlagged}</td>
                    <td>{image.createdAt}</td>
                    <td>{image.updatedAt}</td>
                    <td>{image.destroyTime}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>{:else}
        <div class="user-table">
          <table class="table-head">
            <thead class="table-head-row">
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>isAdmin</th>
                <th>createdAt</th>
                <th>updatedAt</th>
                <th>Password</th>
                <th>destroyTime</th>
              </tr>
            </thead>
            <tbody>
              {#if users}
                {#each users as user (user.id)}
                  <tr>
                    <td>{user.id}</td>
                    <td>{user.userName}</td>
                    <td>{user.isAdmin}</td>
                    <td>{user.createdAt}</td>
                    <td>{user.updatedAt}</td>
                    <td>{user.password}</td>
                    <td>{user.destroyTime}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {onAlertConfirm} {...alertModalOptions}></AlertModal>
{/if}

<!-- {#if showEditImageModal}
  <EditImageModal
    bind:showModal={showEditImageModal}
    {onEditConfirm}
    oldTitle={imageToEdit.title}
    oldDescription={imageToEdit.description}
    oldTags={imageToEdit.tags}
    oldUrl={imageToEdit.url}
  ></EditImageModal>
{/if} -->

<style>
  @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700");

  .ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  @media screen and (max-width: 1050px) {
    .statistics {
      flex-direction: column;
    }

    .box {
      width: 100%;
    }

    .small-box {
      display: block;
      width: 100%;
    }
  }

  .edit-div {
    display: flex;
    gap: 10px;
  }

  .edit-button {
    font-size: 1.2rem;
    background-color: #309329;
    border-radius: 0.3rem;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
  }

  .edit-input {
    width: 90%;
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .edit-button:hover {
    transform: scale(1.05);
  }
  td {
    white-space: nowrap;
    padding: 1rem 1rem;
  }

  th {
    padding: 1rem 1rem;
  }

  table {
    border-spacing: 18px 10px;
    width: 100%;
    border-collapse: separate;
    font-size: 0.5rem;
  }
  .table-head-row {
    background-color: black;
    color: white;
    font-family: "Source Sans Pro", sans-serif;
    white-space: nowrap;
    text-transform: capitalize;
  }

  tr {
    padding: 18px 0;
  }

  .total-num {
    font-size: 1.2rem;
    margin: 0px 0px 1rem 0px;
    color: #54697b;
  }
  .total-info {
    font-size: 1.2rem;
    color: #54697b;
  }

  .icon {
    font-size: 2.7rem;
    margin-top: 1rem;
    color: #54697b;
  }

  .statistics {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 10px;
  }

  .box {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
    height: 10rem;
    width: 20rem;
    color: white;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    border: none;
  }

  .selected {
    box-shadow: 10px 10px 10px grey;
  }

  .blue {
    background-color: white;
  }

  .green {
    background-color: white;
  }

  .container {
    display: flex;
  }

  .content {
    flex: 1;
    padding: 0px 0.5rem;
    margin-left: 14vw;
    width: 75vw;
  }

  .contents {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .main-card {
    background-color: #ebebeb;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 1.5rem 2rem 1.5rem 2rem;
  }
</style>
