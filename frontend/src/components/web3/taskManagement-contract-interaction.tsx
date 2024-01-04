'use client'

import { FC, useEffect, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'
import { Contract } from '@polkadot/api-contract/base'
import { finality } from '@polkadot/types/interfaces/definitions'

interface Task {
  description: string,
  completed: boolean,
}

type AddTaskDescription = { description: string }

export const TaskManagementContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.TaskManagement)
  const [taskList, setTaskList] = useState<Task[]>([])
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [createIsLoading, setCreateIsLoading] = useState<boolean>()
  const form = useForm<AddTaskDescription>() 

  const { register, reset, handleSubmit } = form

  const fetchTasks = async () => {
    if (!contract || !api) return

    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'getTasks')
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'getTasks') 
      if (isError) throw new Error(decodedOutput)
      console.log(decodedOutput)
      const tasks: Task[] = output.map((obj: any) => ({
        description: obj.description,
        completed: obj.completed
      }))
      //tasks.map((task: Task) => (
      //  console.log(task.description)
      //)) 
      setTaskList(tasks) 
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching tasks. Try again...')
      setTaskList([])
    } finally {
      setFetchIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchTasks()
  }, [contract])

  const createNewTask = async ({ description }: AddTaskDescription) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again...')
      return
    }  
    
    setCreateIsLoading(true)
    try {
      await contractTxWithToast(api, activeAccount.address, contract, 'createTask', {}, [
        description,
      ]) 
      reset()
    } catch(e) {
      console.error(e)
    } finally {
      setCreateIsLoading(false)
      fetchTasks()
    }
    
  }

  return (
    <>
      <div className="flex max-w-[22rem] grow flex-col gap-4">
        <h2 className="text-center font-mono text-gray-400">Task Management Smart Contract</h2>
        <Form {...form}>
          {/* Fetched Greeting */}
          <Card>
            <CardContent className="pt-6">
              <FormItem>
                <FormLabel className="text-base">Fetched Tasks</FormLabel>
                {fetchIsLoading || !contract 
                ? 
                'Loading' 
                :
                taskList.map((task, index) => (
                  
                  <Card key={index}>
                      <Input
                        placeholder={task.description}
                        disabled={true}
                      />
                  </Card>  
                ))}
              </FormItem>
            </CardContent>
          </Card>

          {/* Update Greeting */}
          <Card>
            <CardContent className="pt-6">
              <form
                onSubmit={handleSubmit(createNewTask)}
                className="flex flex-col justify-end gap-2"
              >
                <FormItem>
                  <FormLabel className="text-base">Add New Task</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input disabled={createIsLoading} {...register('description')} />
                      <Button
                        type="submit"
                        className="bg-primary font-bold"
                        disabled={fetchIsLoading || createIsLoading}
                        isLoading={createIsLoading}
                      >
                        Submit
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              </form>
            </CardContent>
          </Card>
        </Form>

        {/* Contract Address */}
        <p className="text-center font-mono text-xs text-gray-600">
          {contract ? contractAddress : 'Loading…'}
        </p>
      </div>
    </>
  ) 
}
