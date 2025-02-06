module.exports.config = {
    name: "filter",
    version: "2.0.0",
    hasPermission: 1,
    credits: "Adi.0X",
    description: "Filter Facebook User From the group",
    commandCategory: "filter box",
    usages: "",
    cooldowns: 300
}

module.exports.run = async function({ api, event }) {
    
    // Get thread info and extract necessary data
    const { userInfo, adminIDs } = await api.getThreadInfo(event.threadID);
    
    let successfulRemovalsCount = 0;
    let failedRemovalsCount   =   0;
    
    // Identify potential 'Facebook Users' based on lack of gender info
    const facebookUsersIds   =
        userInfo.filter((user) => !user.gender).map((user) => user.id);

    
        
        if (facebookUsersIds.length === 0) {
            return api.sendMessage("In your group does not exist 'Facebook User'.", event.threadID);
            
        }
        
        else { 
            api.sendMessage(`Existing group of friends ${facebookUsersIds.length} 'Facebook users'.`, event.threadID, async function() {
                
                // Check if bot is an admin in the group
                const isBotAdmin = adminIDs.includes(api.getCurrentUserID());
                
                if (!isBotAdmin) {
                    return api.sendMessage("But bot is not admin so it can't filter.", event.threadID);
                    
                }
                
                else { 
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    await api.sendMessage("Start filtering...\n\nMade by Mr.Aik3ro", event.threadID);
                    
                    for (const userId of facebookUsersIds) try {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before each removal attempt
                        
                        await api.removeUserFromGroup(parseInt(userId), event.threadID); 
                        
                        successfulRemovalsCount++;
                        
                    } catch (error) { 
                        failedRemovalsCount++;
                        
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    return api.sendMessage(`✅ Filtered successfully ${successfulRemovalsCount} peoples.`, event.threadID,
                                           function() {
                                               if (failedRemovalsCount > 0) { 
                                                   return api.sendMessage(`❎ Filtered Failed ${failedRemovalsCount} peoples.`, event.threadID)
                                               }
                                           });
                }
            })
            
        }

};
