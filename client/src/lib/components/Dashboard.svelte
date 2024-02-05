<script>
  import { goto } from "$app/navigation"
  import ChoiceModal from "./ChoiceModal.svelte"
  import AlertModal from "./AlertModal.svelte"
  import { page } from "$app/stores"

  let showChoiceModal = false
  let choiceModalOptions = {}
  choiceModalOptions.header = "Confirm logout"
  choiceModalOptions.text = "Are you sure you want to logout?"

  let showAlertModal = false
  let alertModalOptions = {}

  const onChoiceConfirm = async (confirmed) => {
    showChoiceModal = false
    if (!confirmed) {
      return
    }
    const response = await fetch(`http://localhost:4000/auth/logout`, {
      method: "GET",
      credentials: "include",
    })
    if (response.ok) {
      goto("/")
    } else {
      alertModalOptions.header = "Could not logout"
      alertModalOptions.message = "Please try again!"
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }
</script>

<div class="dashboard">
  <div class="option">
    <i class="fa fa-home fa-lg" aria-hidden="true"></i><a href="/" class="dashboard-text {$page.route.id === '/' ? 'active' : ''}"
      ><p>Home</p></a
    >
  </div>
  <div class="option {$page.route.id.startsWith('/dashboard/myimages') ? 'active' : ''}">
    <i class="fa fa-images fa-lg" aria-hidden="true"></i><a href="/dashboard/myimages" class="dashboard-text"><p>My Images</p></a>
  </div>
  <div class="option {$page.route.id.startsWith('/dashboard/upload') ? 'active' : ''}">
    <i class="fa fa-cloud-upload fa-lg" aria-hidden="true"></i><a href="/dashboard/upload" class="dashboard-text"><p>Upload</p></a
    >
  </div>
  <div class="option">
    <i class="fa fa-search fa-lg {$page.route.id.startsWith('/dashboard/search') ? 'active' : ''}" aria-hidden="true"></i><a
      href="/dashboard/search"
      class="dashboard-text"><p>Search</p></a
    >
  </div>
  <div class="option {$page.route.id.startsWith('/dashboard/myprofile') ? 'active' : ''}">
    <i class="fa fa-user fa-lg" aria-hidden="true"></i><a href="/dashboard/myprofile" class="dashboard-text"
      ><p>My Profile</p>
      <br />
    </a>
  </div>
  <div class="option logout" on:click={() => (showChoiceModal = true)}>
    <i class="fa fa-sign-out fa-lg" aria-hidden="true"></i>
    <p>Log out</p>
  </div>
  {#if showChoiceModal}
    <ChoiceModal bind:showModal={showChoiceModal} {onChoiceConfirm} {...choiceModalOptions}></ChoiceModal>
  {/if}
  {#if showAlertModal}
    <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
  {/if}
</div>

<style>
  .option {
    display: flex;
    color: #fff;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .dashboard {
    width: 15rem;
    background-color: #172740;
    height: 100vh;
    width: 10vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    min-width: 100px;
    position: fixed;
  }

  .dashboard-text {
    font-size: 1rem;
    color: #fff;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logout {
    cursor: pointer;
  }

  .active {
    text-shadow: 0 0 20px #fff;
  }
</style>
