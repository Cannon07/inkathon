#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod taskManagement {

    use core::u16;

    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;

    #[ink(storage)]
    pub struct TaskManagement {
        tasks: Vec<Task>,
    }

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    #[derive(Default, Debug, Clone)]
    pub struct Task {
        description: String,
        completed: bool,
    }

    impl TaskManagement {

        #[ink(constructor)]
        pub fn new() -> Self {
            Self { tasks: Vec::new() }
        }

        #[ink(message)]
        pub fn create_task(&mut self, description: String) {
            let new_task = Task {
                description,
                completed: false,
            };
            self.tasks.push(new_task);
        }

        #[ink(message)]
        pub fn complete_task(&mut self, index: u16) {
            if let Some(task) = self.tasks.get_mut(index as usize) {
                task.completed = true;
            }
        }

        #[ink(message)]
        pub fn get_tasks(&self) -> Vec<Task> {
            self.tasks.clone().into_iter().collect()
        }

    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn create_task_works() {
            let mut task_manager = TaskManagement::new();
            let description = "Example Task".to_string();
            task_manager.create_task(description.clone());
            let stored_task = task_manager.get_tasks();
            assert_eq!(stored_task.get(0).unwrap().description, description);
            assert_eq!(stored_task.get(0).unwrap().completed, false);
        }

        #[ink::test]
        fn complete_task_works() {
            let mut task_manager = TaskManagement::new();
            let description = "Example Task".to_string();
            task_manager.create_task(description.clone());
            task_manager.complete_task(0);
            let task_status = task_manager.get_tasks().get(0).unwrap().completed;
            assert_eq!(task_status, true);
        }
    }
}
