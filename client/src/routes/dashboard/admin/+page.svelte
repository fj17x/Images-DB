<script>
  import Dashboard from "$lib/components/Dashboard.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { userDetails } from "../../../stores/userDetails.js"
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

  let showAlertModal = false
  let alertModalOptions = {}

  let users = []
  let totalUsers = 0
  let images = []
  let totalImages = 0

  let clickedBox = null

  const handleClick = (box) => {
    clickedBox = box
  }

  const getNumberOfUsers = async () => {
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

  onMount(async () => {
    await getNumberOfUsers()
    if (!$userDetails.isAdmin) {
      alertModalOptions.header = "Cannot access page"
      alertModalOptions.message = "This page is only accessible by an admin."
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
    await getNumberOfUsers()
  })

  const onAlertConfirm = () => {
    goto("/dashboard/myimages")
    showAlertModal = false
  }
</script>

<div class="container">
  <Dashboard />
  <div class="contents">
    <div class="content">
      <h3>Statistics</h3>
      <div class="main-card">
        <div class="statistics">
          <button class="box blue" on:click={() => handleClick("users")}>
            <i class="fa-solid fa-users icon"></i>
            <p class="total-info">Total users</p>
            <p class="total-num">{totalUsers || " "}</p>
          </button>
          <button class="box green" on:click={() => handleClick("images")}>
            <i class="fa-regular fa-images icon"></i>
            <p class="total-info">Total images</p>
            <p class="total-num">{totalImages || " "}</p>
          </button>
        </div>
      </div>
    </div>
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
              {#each images as image (image.id)}
                <tr>
                  <td>{image.id}</td>
                  <td>{image.title}</td>
                  <td>{image.url}</td>
                  <td>{image.description}</td>
                  <td>{image.ownerId}</td>
                  <td>
                    {#each image.tags as tag}
                      {tag} &nbsp;
                    {/each}
                  </td>
                  <td>{image.createdAt}</td>
                  <td>{image.isFlagged}</td>
                  <td>{image.updatedAt}</td>
                  <td>{image.destroyTime}</td>
                </tr>
              {/each}
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
                <th>destroyTime</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              {#each users as user (user.id)}
                <tr>
                  <td>{user.id}</td>
                  <td>{user.userName}</td>
                  <td>{user.isAdmin}</td>
                  <td>{user.createdAt}</td>
                  <td>{user.updatedAt}</td>
                  <td>{user.destroyTime}</td>
                  <td>{user.password}</td>
                </tr>
              {/each}
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

<style>
  @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700");

  td {
    /* text-align: center; */
    white-space: nowrap;
    padding: 0rem 1.5rem;
  }

  table {
    border-collapse: collapse;
  }
  .table-head-row {
    background-color: black;
    color: white;
    font-family: "Source Sans Pro", sans-serif;
    white-space: nowrap;
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
    box-shadow: 10px 10px 5px grey;
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
    padding: 0px 2rem;
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
