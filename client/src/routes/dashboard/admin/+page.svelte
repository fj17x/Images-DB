<script>
  import Sidebar from "$lib/components/Sidebar.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { userDetails } from "../../../stores/userDetails.js"
  import { onMount } from "svelte"
  //import EditImageModal from "$lib/components/EditImageModal.svelte"

  let showAlertModal = false
  let alertModalOptions = {}

  let users = []
  let images = []
  let totalUsers = 0
  let totalImages = 0

  let clickedBox = "users"
  let first = true

  let currentOffsetForUsers = 0
  let currentOffsetForImages = 0

  let imageIdGiven
  let userIdGiven

  let imageToEdit = {}
  let showEditImageModal = false

  const handleScroll = async (entity) => {
    console.log("🚀 ~ handleScroll ~ entity:", entity)
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 70) {
      await fetchUsersOrImages()
    }
  }

  const fetchUsersOrImages = async (select) => {
    if (first || select === "users" || clickedBox === "users") {
      const response = await fetch(
        `http://localhost:4000/users?offset=${currentOffsetForUsers}&sortBy=id&sortOrder=asc&showDeleted=true`,
        {
          method: "GET",
          credentials: "include",
        }
      )

      const usersReply = await response.json()
      totalUsers = usersReply.totalUsers

      if (!usersReply.data || usersReply.data.length === 0) {
        return
      }

      const uniqueUsers = usersReply.data.filter((newUser) => {
        return !users.some((user) => user.id === newUser.id)
      })
      users = [...users, ...uniqueUsers]
      currentOffsetForUsers += 50
    }
    if (first || select === "images" || clickedBox === "images") {
      const response = await fetch(
        `http://localhost:4000/images?offset=${currentOffsetForImages}&sortBy=id&sortOrder=asc&showDeleted=true&showFlagged=true`,
        {
          method: "GET",
          credentials: "include",
        }
      )
      const imagesReply = await response.json()
      totalImages = imagesReply.totalImages

      if (!imagesReply.data || imagesReply.data.length === 0) {
        return
      }

      const uniqueImages = imagesReply.data.filter((newImage) => {
        return !images.some((image) => image.id === newImage.id)
      })
      images = [...images, ...uniqueImages]
      currentOffsetForImages += 50
    }

    first = false
    select = "none"
  }

  const handleClick = (box) => {
    clickedBox = box
  }

  const onAlertConfirm = () => {
    showAlertModal = false
  }

  // const handleImageEdit = async () => {
  //   const responseGET = await fetch(`http://localhost:4000/images/${imageIdGiven}`, {
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
      currentOffsetForImages = 0
      images = []
      await fetchUsersOrImages("images")
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
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
    currentOffsetForImages = 0
    images = []
    await fetchUsersOrImages("images")
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
      currentOffsetForUsers = 0
      users = []
      await fetchUsersOrImages("users")
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
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
    await fetchUsersOrImages()
    if (!$userDetails.isAdmin) {
      alertModalOptions.header = "Cannot access page"
      alertModalOptions.message = "This page is only accessible by an admin."
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  })
</script>

<svelte:window on:scroll={handleScroll} />

<div class="container">
  <Sidebar />
  <div class="contents">
    <div class="content">
      <h3>Admin Panel</h3>
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
          <div class="main-inputs">
            <div class="small-box">
              <p class="total-info">Enter User ID:</p>
              <div class="edit-div">
                <input type="text" bind:value={userIdGiven} class="edit-input" />
                <!-- <button class="edit-button">Edit</button> -->
                <button class="edit-button delete-button" on:click={() => handleUserDeletion(true)}>Delete</button>
                <button class="edit-button restore-button" on:click={() => handleUserDeletion(false)}>Restore</button>
              </div>
            </div>
            <div class="small-box">
              <p class="total-info">Enter Image ID:</p>
              <div class="edit-div">
                <input type="text" bind:value={imageIdGiven} class="edit-input" />
                <!-- <button class="edit-button" on:click={handleImageEdit}>Edit</button> -->
                <button class="edit-button flag-button" on:click={() => handleImageFlagging(true)}>Flag</button>
                <button class="edit-button unflag-button" on:click={() => handleImageFlagging(false)}>Unflag</button>
                <button class="edit-button delete-button" on:click={() => handleImageDeletion(true)}>Delete</button>
                <button class="edit-button restore-button" on:click={() => handleImageDeletion(false)}>Restore</button>
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
            <thead>
              <tr>
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
                    <td>{image.description}</td>
                    <td>{image.ownerId}</td>
                    <td>
                      {#each image.tags as tag}
                        {tag};
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
            <thead>
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

<!-- 
{#if showEditImageModal}
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

  .flag-button {
    color: orange;
  }
  .unflag-button {
    color: darkslateblue;
  }

  .delete-button {
    color: red;
  }

  .restore-button {
    color: green;
  }

  td {
    padding: 1rem 0.4rem;
  }
  th {
    padding: 1rem 0rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    border: 1px solid #ddd;
    /* word-break: break-word; */
  }

  .images-table {
    width: 100%;
  }

  thead {
    background-color: black;
    color: white;
    font-family: "Source Sans Pro", sans-serif;
    text-transform: capitalize;
  }

  .main-inputs {
    padding-left: 0.7rem;
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
    font-size: 0.6rem;
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
    margin-left: 11vw;
    width: 86vw;
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
    padding: 2rem 0.5rem 3rem 0.5rem;
  }
</style>
